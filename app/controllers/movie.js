var Movie = require('../models/movie')
var Category = require('../models/category')
var Comment = require('../models/comment')
var _ = require('underscore')

// 详情页
exports.detail = function(req,res) {
  var id = req.params.id
  Movie.findById(id,function(err,movie){
    // 使用回调的方式来获取movieId所对应的comment
    Comment
      .find({movie: id}) // 通过id找到这个电影的评论数据
      .populate('from', 'name') // 通过populate找到评论的userName，返回name这个数据
      .populate('reply.from reply.to', 'name') // 通过populate找到评论的userName，返回name这个数据
      .exec(function(err, comments) {
        console.log(comments)
        res.render('detail',{
          title: 'imooc ' + movie.title,
          movie: movie,
          comments: comments
        })
      })
  })
}

// 电影数据的新建页
exports.new = function(req,res) {
  Category.find({}, function(err, categories) {
    res.render('admin', {
      title: 'imooc 后台录入页',
      categories: categories,
      movie:{},
    })
  })
}

// 电影数据的更新页
// 更新页和新建页复用了
exports.update = function(req,res){
  var id = req.params.id
  if(id){
    Movie.findById(id,function(err, movie){

      Category.find({}, function(err, category) {
        res.render('admin',{
          title:'imooc 后台更新页',
          movie: movie,
          categories: category,
        })
      })

    })
  }
}

// 电影数据的存储
exports.save = function(req,res){
  var id = req.body.movie._id;
  var movieObj = req.body.movie;
  var _movie = null;
  if (id) {
    Movie.findById(id, (err,movie)=>{
      if (err) {
        console.log(err);
      }

      _movie = _.extend(movie, movieObj);
      _movie.save(function (err, movie) {
        if (err) {
          console.log(err);
        };

        res.redirect('/movie/' + movie._id);
      })
    })
  }

  else{
    _movie = new Movie(movieObj)

    var catId = _movie.category

    _movie.save(function(err,movie){
      if (err) {
        console.log(err)
      }

      // 通过当前的catId来拿到此id对应的分类，然后存到category表中
      Category.findById(catId, function(err, category) {
        category.movies.push(movie._id)

        category.save(function(err, category) {
          res.redirect('/movie/' + movie._id)
        })
      })
    })
  }
}

exports.list = function(req,res) {
  Movie.fetch(function(err,movies){
    if(err){
      console.log(err)
    }
    res.render('list',{
      title:'imooc 列表页',
      movies: movies
    })
  })
}


// 删除
exports.del = function(req,res) {
  let id = req.query.id
  Movie.deleteOne({_id: id}, function (err,movie) {
    if (err) {
      console.log(err)
    } else {
      res.json({success: 1})
    }
  })
}