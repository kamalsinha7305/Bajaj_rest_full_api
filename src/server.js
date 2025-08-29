import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const FULL_NAME = (process.env.FULL_NAME || "john doe").trim().toLowerCase();
const DOB_DDMMYYYY = (process.env.DOB_DDMMYYYY || "17091999").trim();
const EMAIL = process.env.EMAIL || "john@xyz.com";
const ROLL_NUMBER = process.env.ROLL_NUMBER || "ABCD123";

function makeUserId(fullLower, dob) {

    const slug = fullLower.replace(/\s+/g, "_");
    return `${slug}_${dob}`;
}

function isPureNumberToken(token) {
    
    return /^-?\d+$/.test(token);
}

function isPureAlphaToken(token) {
    return /^[A-Za-z]+$/.test(token);
}

function extractAllLettersInOrder(token) {
  
    const out = [];
    for (const ch of token) {
        if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) out.push(ch);
    }
    return out;
}

function buildConcatStringFromLetters(allLettersArray) {

    const rev = [...allLettersArray].reverse();
    return rev
        .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
        .join("");
}

app.post("/bfhl", (req, res) => {
    const user_id = makeUserId(FULL_NAME, DOB_DDMMYYYY);

    try {
      
        if (!req.body || !Array.isArray(req.body.data)) {
            return res.status(200).json({
                is_success: false,
                user_id,
                email: EMAIL,
                roll_number: ROLL_NUMBER,
                message: 'Invalid payload: expected JSON body with "data": [ ... ]'
            });
        }

        const data = req.body.data;

     
        const tokens = data.map((t) =>
            t === null || t === undefined ? "" : String(t)
        );

        const odd_numbers = [];
        const even_numbers = [];
        const alphabets = [];
        const special_characters = [];
        let sum = 0;
        const collectedLetters = [];

        for (const tok of tokens) {
          
            collectedLetters.push(...extractAllLettersInOrder(tok));

            if (isPureNumberToken(tok)) {
              
                const n = parseInt(tok, 10);
             
                const abs = Math.abs(n);
                if (abs % 2 === 0) {
                    even_numbers.push(tok);
                } else {
                    odd_numbers.push(tok);
                }
                sum += n;
            } else if (isPureAlphaToken(tok)) {
            
                alphabets.push(tok.toUpperCase());
            } else {
                
               
                if (tok.length > 0) special_characters.push(tok);
            }
        }

        const concat_string = buildConcatStringFromLetters(collectedLetters);

        return res.status(200).json({
            is_success: true,
            user_id,
            email: EMAIL,
            roll_number: ROLL_NUMBER,
            odd_numbers,
            even_numbers,
            alphabets,
            special_characters,
            sum: String(sum),
            concat_string
        });
    } catch (err) {
      
        return res.status(200).json({
            is_success: false,
            user_id,
            email: EMAIL,
            roll_number: ROLL_NUMBER,
            message: "An unexpected error occurred"
        });
    }
});


app.get("/", (req, res) => {
    res.json({ status: "OK", route: "/bfhl" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BFHL API listening on port ${PORT}`);
});
