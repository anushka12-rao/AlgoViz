#pragma once
#include <string>
#include <vector>
#include <map>
#include <sstream>
#include <stdexcept>
#include <cctype>

namespace algoviz {

enum class JsonType {
    Null,
    Bool,
    Number,
    String,
    Array,
    Object
};

class JsonValue {
public:
    JsonType type;
    bool boolVal;
    double numVal;
    std::string strVal;
    std::vector<JsonValue> arrVal;
    std::map<std::string, JsonValue> objVal;

    JsonValue() : type(JsonType::Null), boolVal(false), numVal(0.0) {}
    explicit JsonValue(bool b) : type(JsonType::Bool), boolVal(b), numVal(b ? 1.0 : 0.0) {}
    explicit JsonValue(double n) : type(JsonType::Number), boolVal(n != 0.0), numVal(n) {}
    explicit JsonValue(int n) : type(JsonType::Number), boolVal(n != 0), numVal(n) {}
    explicit JsonValue(const std::string &s) : type(JsonType::String), boolVal(false), numVal(0.0), strVal(s) {}
    explicit JsonValue(const char *s) : type(JsonType::String), boolVal(false), numVal(0.0), strVal(s ? s : "") {}
    explicit JsonValue(JsonType t) : type(t), boolVal(false), numVal(0.0) {}

    bool isNull() const { return type == JsonType::Null; }
    bool isBool() const { return type == JsonType::Bool; }
    bool isNumber() const { return type == JsonType::Number; }
    bool isString() const { return type == JsonType::String; }
    bool isArray() const { return type == JsonType::Array; }
    bool isObject() const { return type == JsonType::Object; }

    bool getBool(bool defaultVal = false) const {
        return isBool() ? boolVal : defaultVal;
    }

    int getInt(int defaultVal = 0) const {
        return isNumber() ? static_cast<int>(numVal) : defaultVal;
    }

    double getDouble(double defaultVal = 0.0) const {
        return isNumber() ? numVal : defaultVal;
    }

    std::string getString(const std::string &defaultVal = "") const {
        return isString() ? strVal : defaultVal;
    }

    const std::vector<JsonValue>& getArray() const {
        static const std::vector<JsonValue> emptyArr;
        return isArray() ? arrVal : emptyArr;
    }

    std::vector<int> getIntArray() const {
        std::vector<int> res;
        if (isArray()) {
            res.reserve(arrVal.size());
            for (const auto &item : arrVal) {
                if (item.isNumber()) {
                    res.push_back(item.getInt());
                }
            }
        }
        return res;
    }

    bool hasKey(const std::string &key) const {
        if (!isObject()) return false;
        return objVal.find(key) != objVal.end();
    }

    const JsonValue& operator[](const std::string &key) const {
        static const JsonValue nullVal;
        if (!isObject()) return nullVal;
        auto it = objVal.find(key);
        if (it != objVal.end()) return it->second;
        return nullVal;
    }

    const JsonValue& operator[](size_t index) const {
        static const JsonValue nullVal;
        if (!isArray() || index >= arrVal.size()) return nullVal;
        return arrVal[index];
    }
};

class JsonParser {
private:
    std::string src;
    size_t pos;

    void skipWhitespace() {
        while (pos < src.size() && (src[pos] == ' ' || src[pos] == '\t' || src[pos] == '\n' || src[pos] == '\r')) {
            pos++;
        }
    }

    char peek() {
        skipWhitespace();
        if (pos >= src.size()) return '\0';
        return src[pos];
    }

    char get() {
        skipWhitespace();
        if (pos >= src.size()) return '\0';
        return src[pos++];
    }

    std::string parseString() {
        if (get() != '"') throw std::runtime_error("Expected '\"' to start string");
        std::string s;
        while (pos < src.size()) {
            char c = src[pos++];
            if (c == '"') {
                return s;
            }
            if (c == '\\') {
                if (pos >= src.size()) throw std::runtime_error("Unexpected end of string escape");
                char esc = src[pos++];
                switch (esc) {
                    case '"': s += '"'; break;
                    case '\\': s += '\\'; break;
                    case '/': s += '/'; break;
                    case 'b': s += '\b'; break;
                    case 'f': s += '\f'; break;
                    case 'n': s += '\n'; break;
                    case 'r': s += '\r'; break;
                    case 't': s += '\t'; break;
                    case 'u': {
                        if (pos + 4 <= src.size()) {
                            pos += 4;
                            s += '?';
                        }
                        break;
                    }
                    default: s += esc; break;
                }
            } else {
                s += c;
            }
        }
        throw std::runtime_error("Unterminated string literal");
    }

    JsonValue parseNumber() {
        skipWhitespace();
        size_t start = pos;
        if (pos < src.size() && (src[pos] == '-' || src[pos] == '+')) {
            pos++;
        }
        while (pos < src.size() && std::isdigit(static_cast<unsigned char>(src[pos]))) {
            pos++;
        }
        if (pos < src.size() && src[pos] == '.') {
            pos++;
            while (pos < src.size() && std::isdigit(static_cast<unsigned char>(src[pos]))) {
                pos++;
            }
        }
        if (pos < src.size() && (src[pos] == 'e' || src[pos] == 'E')) {
            pos++;
            if (pos < src.size() && (src[pos] == '+' || src[pos] == '-')) pos++;
            while (pos < src.size() && std::isdigit(static_cast<unsigned char>(src[pos]))) {
                pos++;
            }
        }
        std::string numStr = src.substr(start, pos - start);
        double val = std::stod(numStr);
        return JsonValue(val);
    }

    JsonValue parseArray() {
        if (get() != '[') throw std::runtime_error("Expected '[' to start array");
        JsonValue res(JsonType::Array);
        skipWhitespace();
        if (peek() == ']') {
            get();
            return res;
        }
        while (true) {
            res.arrVal.push_back(parseValue());
            char next = peek();
            if (next == ']') {
                get();
                break;
            }
            if (next == ',') {
                get();
            } else {
                throw std::runtime_error(std::string("Expected ',' or ']' in array, got '") + next + "'");
            }
        }
        return res;
    }

    JsonValue parseObject() {
        if (get() != '{') throw std::runtime_error("Expected '{' to start object");
        JsonValue res(JsonType::Object);
        skipWhitespace();
        if (peek() == '}') {
            get();
            return res;
        }
        while (true) {
            skipWhitespace();
            if (peek() != '"') {
                throw std::runtime_error("Expected string key in object");
            }
            std::string key = parseString();
            skipWhitespace();
            if (get() != ':') {
                throw std::runtime_error("Expected ':' after key in object");
            }
            res.objVal[key] = parseValue();
            char next = peek();
            if (next == '}') {
                get();
                break;
            }
            if (next == ',') {
                get();
            } else {
                throw std::runtime_error(std::string("Expected ',' or '}' in object, got '") + next + "'");
            }
        }
        return res;
    }

public:
    JsonParser(const std::string &input) : src(input), pos(0) {}

    JsonValue parseValue() {
        skipWhitespace();
        if (pos >= src.size()) {
            throw std::runtime_error("Unexpected end of JSON input");
        }
        char c = src[pos];
        if (c == '{') return parseObject();
        if (c == '[') return parseArray();
        if (c == '"') return JsonValue(parseString());
        if (c == '-' || std::isdigit(static_cast<unsigned char>(c))) return parseNumber();
        if (src.compare(pos, 4, "true") == 0) { pos += 4; return JsonValue(true); }
        if (src.compare(pos, 5, "false") == 0) { pos += 5; return JsonValue(false); }
        if (src.compare(pos, 4, "null") == 0) { pos += 4; return JsonValue(JsonType::Null); }

        throw std::runtime_error(std::string("Unexpected character in JSON input: '") + c + "'");
    }

    static JsonValue parse(const std::string &input) {
        JsonParser p(input);
        JsonValue v = p.parseValue();
        p.skipWhitespace();
        return v;
    }
};

} // namespace algoviz
