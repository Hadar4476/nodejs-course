exports.getPosts = (req, res, next) => {
  const posts = [
    {
      id: new Date().toISOString(),
      title: "Post #1",
      content: "some content",
    },
  ];

  res.status(200).json({
    posts,
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;

  const newPost = {
    id: new Date().toISOString(),
    title,
    content,
  };

  // status 201 indicates that the server succeeded with the action and also managed to append a resource
  res.status(201).json({
    message: "Post added successfully",
    post: newPost,
  });
};
