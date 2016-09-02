// movies.js
var Movies = require('../models/movies');
var sw = require("swagger-node-express");
var param = sw.params;
var url = require("url");
var swe = sw.errors;
var _ = require('underscore');

/*
 *  Util Functions
 */

function writeResponse(res, response, start) {
  sw.setHeaders(res);
  res.header('Duration-ms', new Date() - start);
  if (response.neo4j) {
    res.header('Neo4j', JSON.stringify(response.neo4j));
  }
  res.send(JSON.stringify(response.results));
}

function parseUrl(req, key) {
  return url.parse(req.url, true).query[key];
}

function parseBool(req, key) {
  return 'true' == url.parse(req.url, true).query[key];
}


/*
 * API Specs and Functions
 */

exports.list = {
  'spec': {
    "description": "List all movies",
    "path": "/movies",
    "notes": "Returns all movies",
    "summary": "Find all movies",
    "method": "GET",
    "params": [],
    "responseClass": "List[Movie]",
    "errorResponses": [swe.notFound('movies')],
    "nickname": "getMovies"
  },
  'action': function (req, res) {
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();
    Movies.getAll(null, options, (err, response) => {
      if (err || !response.results) throw swe.notFound('movies');
      writeResponse(res, response, start);
    });
  }
};

exports.movieCount = {
  'spec': {
    "description": "Movie count",
    "path": "/movies/count",
    "notes": "Movie count",
    "summary": "Movie count",
    "method": "GET",
    "params": [],
    "responseClass": "Count",
    "errorResponses": [swe.notFound('movies')],
    "nickname": "movieCount"
  },
  'action': function (req, res) {
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();
    Movies.getAllCount(null, options, (err, response) => {
      // if (err || !response.results) throw swe.notFound('movies');
      writeResponse(res, response, start);
    });
  }
};

exports.findById = {
  'spec': {
    "description": "find a movie",
    "path": "/movies/{id}",
    "notes": "Returns a movie based on ID",
    "summary": "Find movie by ID",
    "method": "GET",
    "params": [
      param.path("id", "ID of movie that needs to be fetched", "integer")
    ],
    "responseClass": "Movie",
    "errorResponses": [swe.invalid('id'), swe.notFound('movie')],
    "nickname": "getMovieById"
  },
  'action': function (req, res) {
    var id = req.params.id;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!id) throw swe.invalid('id');

    var params = {
      id: id
    };

    Movies.getById(params, options, (err, response) => {
      if (err) throw swe.notFound('movie');
      writeResponse(res, response, start);
    });
  }
};

exports.findByTitle = {
  'spec': {
    "description": "Find a movie",
    "path": "/movies/title/{title}",
    "notes": "Returns a movie based on title",
    "summary": "Find movie by title",
    "method": "GET",
    "params": [
      param.path("title", "Title of movie that needs to be fetched", "string")
    ],
    "responseClass": "Movie",
    "errorResponses": [swe.invalid('title'), swe.notFound('movie')],
    "nickname": "getMovieByTitle"
  },
  'action': function (req, res) {
    var title = req.params.title;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!title) throw swe.invalid('title');

    var params = {
      title: title
    };

    Movies.getByTitle(params, options, (err, response) => {
      if (err) throw swe.notFound('movies');
      writeResponse(res, response, start);
    });

  }
};

exports.findByGenre = {
  'spec': {
    "description": "Find a movie",
    "path": "/movies/genre/{id}",
    "notes": "Returns movies based on genre id",
    "summary": "Find movie by genre id",
    "method": "GET",
    "params": [
      param.path("id", "The id of the genre", "integer")
    ],
    "responseClass": "Movie",
    "errorResponses": [swe.invalid('id'), swe.notFound('movies')],
    "nickname": "getMoviesByGenre"
  },
  'action': function (req, res) {
    var id = req.params.id;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!id) throw swe.invalid('id');

    var params = {
      id: id
    };

    Movies.getByGenre(params, options, (err, response) => {
      if (err) throw swe.notFound('movie');
      writeResponse(res, response, start);
    });
  }
};

exports.findMoviesByDateRange = {
  'spec': {
    "description": "Find movies",
    "path": "/movies/daterange/{start}/{end}",
    "notes": "Returns movies between a year range",
    "summary": "Find movie by year range",
    "method": "GET",
    "params": [
      param.path("start", "Year that the movie was released on or after", "integer"),
      param.path("end", "Year that the movie was released before", "integer")
    ],
    "responseClass": "Movie",
    "errorResponses": [swe.invalid('start'), swe.invalid('end'), swe.notFound('movie')],
    "nickname": "getMoviesByDateRange"
  },
  'action': function (req, res) {
    var start = req.params.start;
    var end = req.params.end;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };

    if (!start) throw swe.invalid('start');
    if (!end) throw swe.invalid('end');

    var params = {
      start: start,
      end: end
    };

    Movies.getByDateRange(params, options, (err, response) => {
      if (err) throw swe.notFound('movie');
      writeResponse(res, response, new Date());
    });
  }
};

exports.findMoviesbyDirector = {
  'spec': {
    "description": "Find a director",
    "path": "/movies/directed_by/{id}",
    "notes": "Returns movies directed by a person",
    "summary": "Returns movies directed by a person",
    "method": "GET",
    "params": [
      param.path("id", "Id of the director person", "integer")
    ],
    "responseClass": "Movie",
    "errorResponses": [swe.invalid('id'), swe.notFound('person')],
    "nickname": "findMoviesbyDirector"
  },
  'action': function (req, res) {
    var id = req.params.id;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!id) throw swe.invalid('id');

    var params = {
      id: id
    };

    var callback = function (err, response) {
      if (err) throw swe.notFound('person');
      writeResponse(res, response, start);
    };

    Movies.getMoviesbyDirector(params, options, callback);
  }
};

exports.findMoviesByActor = {
  'spec': {
    "description": "Find movies acted in by some person",
    "path": "/movies/acted_in_by/{id}",
    "notes": "Returns movies that a person acted in",
    "summary": "Find movies by actor",
    "method": "GET",
    "params": [
      param.path("id", "id of the actor who acted in the movies", "integer")
    ],
    "responseClass": "Movie",
    "errorResponses": [swe.invalid('id'), swe.notFound('movie')],
    "nickname": "getMoviesByActor"
  },
  'action': function (req, res) {
    var id = req.params.id;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };

    if (!id) throw swe.invalid('id');

    var params = {
      id: id
    };

    var callback = function (err, response) {
      if (err) throw swe.notFound('movie');
      writeResponse(res, response, new Date());
    };

    Movies.getByActor(params, options, callback);

  }
};

exports.findMoviesByWriter = {
  'spec': {
    "description": "Find movies written by some person",
    "path": "/movies/written_by/{id}",
    "notes": "Returns movies that a person wrote",
    "summary": "Find movies by writer",
    "method": "GET",
    "params": [
      param.path("id", "id of the writer who wrote the movies", "integer")
    ],
    "responseClass": "Movie",
    "errorResponses": [swe.invalid('id'), swe.notFound('movie')],
    "nickname": "getMoviesByWriter"
  },
  'action': function (req, res) {
    var id = req.params.id;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };

    if (!id) throw swe.invalid('id');

    var params = {
      id: id
    };

    Movies.getMoviesByWriter(params, options, (err, response) => {
      if (err) throw swe.notFound('movie');
      writeResponse(res, response, new Date());
    });
  }
};

