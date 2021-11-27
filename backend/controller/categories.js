const slugify = require("slugify")

const pool = require('../db')

const createCategory = async (req, res) => {
    const {cate} = req.body
    try {
        const checkCate = await pool.query('SELECT * FROM "category" WHERE CATEGORY = $1', [cate]) 

        if(checkCate.rowCount > 0) {
            return res.status(500).json("This category has been exist")
        }

        const newCate = await pool.query('INSERT INTO "category"(CATEGORY, CATEGORY_SLUG) VALUES($1, $2) RETURNING *',[cate, slugify(cate)])

        return res.status(200).json(newCate.rows[0])
    } catch (error) {
        console.log(error);
        res.status(500).json("Something went wrong!")
    }
}

module.exports = {createCategory}