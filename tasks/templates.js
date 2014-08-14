/* jshint node: true */

function filterForJS(files) {
  return files.filter(function (file) {
    return file.match(/\.js$/);
  });
}

function filterForCSS(files) {
  return files.filter(function (file) {
    return file.match(/\.css$/);
  });
}

module.exports = function (grunt) {
  grunt.registerMultiTask("index", "Process index.html template", function () {
    var dirRE = new RegExp("^(" + grunt.config("build_dir") + "|" + grunt.config("compile_dir") + ")\/", "g");

    var excluded = grunt.config("vendor_files.exclude");

    var jsFiles = filterForJS(this.filesSrc).map(function (file) {
      var cmps = file.split("/");
      if (cmps[0] == "vendor") {
        file = [cmps[0], cmps[cmps.length-1]].join("/");
      }
      return file.replace(dirRE, "");
    }).filter(function(file) {
      return ! excluded.some(function(excl) { return file.indexOf(excl) !== -1; });
    }).sort(function (fileA, fileB) {
      return fileA < fileB ? 1 : -1;
    });

    var sortedJsFiles = jsFiles.filter(function (file) {
      return file.indexOf("vendor/") === 0;
    });

    jsFiles.forEach(function (file) {
      if (file.indexOf("vendor/") === -1) {
        sortedJsFiles.push(file);
      }
    });

    var cssFiles = filterForCSS(this.filesSrc).map(function (file) {
      return file.replace(dirRE, "");
    });

    var templateData = {
      scripts: sortedJsFiles,
      settings: this.options(),
      styles: cssFiles,
      version: grunt.config("pkg.version"),
      build: grunt.config("proton_build")
    };

    grunt.file.copy("src/index.html", this.data.dir + "/index.html", {
      process: function (contents, path) {
        return grunt.template.process(contents, {
          data: templateData
        });
      }
    });
    grunt.log.writeln("Built against API server:", this.options().apiUrl.green);
  });

  grunt.registerMultiTask("testconfig", "Process test config templates", function () {
    var jsFiles = filterForJS(this.filesSrc)
      , inFile = "conf." + this.target + ".tpl.js"
      , outFile = grunt.config("build_dir") + "/conf." + this.target + ".js";

    grunt.file.copy(inFile, outFile, {
      process: function (contents, path) {
        return grunt.template.process(contents, {
          data: {
            scripts: jsFiles
          }
        });
      }
    });
  });
};
