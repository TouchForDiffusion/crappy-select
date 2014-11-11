all: clean
	@npm install
	@gulp build
clean:
	@rm -rf node_modules