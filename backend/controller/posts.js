const slugify = require("slugify")

const pool = require('../db')

//CONTROLLER CREATE POST
const createPost = async (req, res) => {
  const { title, category, content } = req.body
  const post_image = req.file.path
  const date = new Date()
  const userId = req.user.id
  try {
    if (!post_image.length) return res.status(400).json({ message: 'Please select files to upload' })
    const query =
      'INSERT INTO posts (author, title, title_slug, category, content, post_image, post_on) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
    const values = [userId, title, slugify(title), category, content, post_image, date]
    const result = await pool.query(query, values)
    const post = result.rows[0]
    const resp = {
      post: {
        ids: [],
        contents: {},
      }
    }
    resp.post.contents[post.post_id] = {
      title: post.title,
      title_slug: post.title_slug,
      image: post.post_image,
      category: post.category,
      author: post.author,
      post_on: post.post_on.toLocaleString(),
    }
    resp.post.ids.push(post.post_id)
    return res.status(200).json({ message: 'Added new post', post: resp })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Failed to upload. There was an error.' })
  }
}

//CONTROLLER UPDATE POST
const updatePost = async (req, res) => {
  const {title, category, content} = req.body
  const post_update_on = new Date()
  const post = req.params.id
  const loggedUserId = req.user.id

  try {
    const query =
      'UPDATE posts SET title = $3, title_slug = $4, category = $5, content = $6, post_update_on = $7 WHERE post_id = $1 AND author = $2 RETURNING *'
    const value = [post, loggedUserId, title, slugify(title), category, content, post_update_on]
    const result = await pool.query(query, value)
    const postUpdate = result.rows[0]
    const resp = {
      posts: {
        ids: [],
        contents: {},
      }
    }
    resp.posts.contents[postUpdate.post_id] = {
      title: postUpdate.title,
      title_slug: postUpdate.title_slug,
      images: postUpdate.post_image,
      update_on: postUpdate.post_update_on.toLocaleString(),
      likes: postUpdate.like_count,
      comments: postUpdate.comment_count,
      author: postUpdate.author
    }
    resp.posts.ids.push(postUpdate.post_id)
    return res.status(200).json({ message: 'Post has been updated', posts: resp })
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'There was an error. Please try again later' })
  }
}

//CONTROLLER GET ALL POST
const getAllPost = async (req, res) => {
  const limit = Number(req.query.limit) || 10
  const pageNum = Number(req.query.pageNum) || 1
  const page = limit * (pageNum - 1) 
  try {
    const result = await pool.query('SELECT p.post_id, p.post_image, p.title, u.user_name, c.category, p.content, p.like_count, p.comment_count, p.post_on, p.post_update_on FROM posts p, users u, categories c WHERE p.author = u.user_id AND p.category = c.cate_id ORDER BY post_id LIMIT $2 OFFSET $1', [page, limit])

    const posts = result.rows
    res.status(200).json({'Posts': posts})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'There was an error. Please try again later' })
  }
}

//CONTROLLER GET POST BY USER ID
const getPostByUser = async (req, res) => {
  const userId = req.params.user_id
  const limit = Number(req.query.limit) || 10
  const pageNum = Number(req.query.pageNum) || 1
  const page = limit * (pageNum - 1) 
  try {
    const result = await pool.query('SELECT p.post_id, p.post_image, p.title, u.user_name, u.avatar, c.category, p.content, p.like_count, p.comment_count, p.post_on, p.post_update_on FROM posts p, users u, categories c WHERE p.author = u.user_id AND p.category = c.cate_id AND p.author = $3 ORDER BY post_id LIMIT $2 OFFSET $1', [page, limit, userId])

    const posts = result.rows

    const reps = {
      user : {
        username: posts[0].user_name,
        avatar: posts[0].avatar
      },
      post:[]
    }

    posts.forEach((p) => {
      reps.post.push(
      {
        id: p.post_id,
        title: p.title,
        content: p.content,
        image: p.post_image,
        like_count: p.like_count,
        comment: p.comment_count,
        post_on: p.post_on,
        update: p.post_update_on
      }) 
    })

    res.status(200).json(reps)
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: 'There was an error while deleting the post. PLease try again later' })
  }
}

//CONTROLLER DELETE POST
const deletePost = async (req, res) => {
  const loggedUserId = req.user.id
  const post = req.params.id
  try {
    await pool.query('DELETE FROM posts WHERE post_id = $1 AND author = $2', [
      post,
      loggedUserId
    ])
    return res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: 'There was an error while deleting the post. PLease try again later' })
  }
}

//CONTROLLER LIKE POST

const likePost = async (req, res) => {
  const { post_id } = req.body
  const loggedUserId = req.user.id
  const like_on = new Date()
  try {
    const checkLiked = await pool.query('SELECT * FROM likes WHERE like_post = $1 AND like_user = $2', [post_id, loggedUserId])
    if (!checkLiked.rowCount) {
      let stmt =
        'INSERT INTO likes (like_post, like_user, like_on) VALUES ($1, $2, $3) returning *'
      let result = await pool.query(stmt, [post_id, loggedUserId, like_on])
      const resp = { like_by: result.rows[0].like_user, like_on: result.rows[0].like_on.toLocaleString(), likes: 0 }
      stmt = 'UPDATE posts SET like_count = like_count + 1 WHERE post_id = $1 RETURNING like_count'
      result = await pool.query(stmt, [post_id])
      resp.likes = result.rows[0].like_count
      return res.status(200).json({ message: 'Post liked', content: resp })
    }
    else{
      let stmt = 'DELETE FROM likes WHERE like_post = $1 AND like_user = $2 RETURNING *'
      let result = await pool.query(stmt, [post_id, loggedUserId])
      stmt = 'UPDATE posts SET like_count = like_count - 1 WHERE post_id = $1 RETURNING like_count'
      result = await pool.query(stmt, [post_id])
      return res.status(200).json({
        message: 'Post unLiked'
      })
    } 
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: 'There was an error while liking the post. PLease try again later' })
  }
}

//CONTRoLLER CREATE COMMENT

const createComment = async (req, res) =>{
  const post_id = req.params.post_id
  const loggedUser = req.user.id
  const { comment } = req.body
  const date = new Date()
  try {
    let stmt =
      'INSERT INTO comments (comment_post, comment_user, comment, comment_on) VALUES ($1, $2, $3, $4) returning *'
    let result = await pool.query(stmt, [post_id, loggedUser, comment, date])
    const resp = {
      postId: post_id,
      comment_ids: [result.rows[0].comment_id],
      comment: {
        [result.rows[0].comment_id]: {
          comment: result.rows[0].comment,
          author: loggedUser,
          time: result.rows[0].comment_on.toLocaleString()
        }
      }
    }
    stmt =
      'UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = $1 RETURNING comment_count'
    result = await pool.query(stmt, [post_id])
    resp.comments = result.rows[0].comment_count
    return res.status(200).json({ message: 'Comment created', contents: resp })
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: 'There was an error while commenting on the post. PLease try again later' })
  }
}

//CONTROLLER EDIT COMMENT

const editComment = async (req, res) => {
  const comment_id = req.params.id
  const loggedUser = req.user.id
  const { comment } = req.body
  const date = new Date()
  try {
    let stmt =
      'UPDATE comments SET comment = $1, comment_update_on = $2 WHERE comment_id = $3 AND comment_user = $4 returning *'
    let result = await pool.query(stmt, [comment, date, comment_id, loggedUser])
    const resp = {
      comment_id: result.rows[0].comment_id,
      comment: result.rows[0].comment,
      author: loggedUser,
      time: result.rows[0].comment_update_on.toLocaleString()
    }
    return res.status(200).json({ message: 'Comment has been edited', contents: resp })
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: 'There was an error while editing comment. PLease try again later' })
  }
}

//CONTROLLER GET COMMENT

const getComment = async (req, res) => {
  const post_id = req.params.post_id
  const limit = Number(req.query.limit) || 5
  try {
    let query =
      'SELECT comments.*, user_name, avatar FROM comments INNER JOIN users ON users.user_id = comments.comment_user WHERE comment_post = $1 ORDER BY comment_id DESC LIMIT $2'
    const values = [post_id, limit]
    const result = await pool.query(query, values)
    const resp = {
      postId: post_id,
      commentIds: [],
      comments: {},
      users: {}
    }
    result.rows.forEach((comment) => {
      resp.commentIds.push(comment.comment_id)
      resp.comments[comment.comment_id] = {
        comment: comment.comment,
        author: comment.comment_user,
        timestamp: comment.comment_on
      }
      if (!(comment.user_id in resp.users)) {
        resp.users[comment.comment_user] = {
          username: comment.user_name,
          avatar: comment.avatar
        }
      }
    })
    resp.commentIds.sort((a, b) => a - b)
    return res.status(200).json({ comments: resp })
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: 'There was an error while getting comment. PLease try again later' })
  }
}

//CONTROLLER DELETE COMMENT

const deleteComment = async (req, res) => {
  const comment_id = req.params.id
  const loggedUserId = req.user.id
  try {
    let stmt = 'DELETE FROM comments WHERE comment_id = $1 AND comment_user = $2 RETURNING comment_id, comment_post'
    let result = await pool.query(stmt, [comment_id, loggedUserId])
    stmt =
      'UPDATE posts SET comment_count = comment_count - 1 WHERE post_id = $1 RETURNING comment_count, post_id'
    result = await pool.query(stmt, [result.rows[0].comment_post])
    return res.status(200).json({
      message: 'Comment removed',
      content: { postId: result.rows[0].post_id, comments: result.rows[0].comment_count }
    })
    //return res.status(200).json(result.rows[0])
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: 'There was an error while deleting the comment. PLease try again later' })
  }
}
module.exports = { createPost, getAllPost, updatePost, deletePost, getPostByUser, likePost, createComment, editComment, getComment, deleteComment }