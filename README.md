# chip8-js

[CHIP-8][] interpreter in JavaScript.

*Work in progress*

## Motivation

Off the heels of working on my [Joy interpreter](https://github.com/jimf/joy-js),
I started down the path of looking into how VMs (as in the JVM, etc.; *not*
hardware virtualization) and emulators work, since I knew conceptually that
they are stack-based, much like Joy. The search very quickly led me to CHIP-8,
which seems to be the canonical "beginner's project" when it comes to
emulation, as the specs are well documented, and the number of opcodes to
implement is relatively small. Once I settled on CHIP-8 emulation, I discovered
Jeffrey Massung's [awesome GO implementation](https://massung.github.io/CHIP-8/)
and thought I'd take a stab at recreating the UI for the web.

## Roadmap

- [x] ROM interpreter
- [ ] Assembler
- [ ] Web-based front end
  - [ ] ROM selection interface
  - [ ] Dynamic canvas size
  - [ ] Better handling of portrait/landscape orientations
- [ ] Publish front end to GitHub pages
- [ ] Bonus: Implement extra instructions for the SUPER CHIP-8 (SCHIP-8/CHIP-48)

## How to run

    $ npm install
    $ npm start

## Resources

- [Cowgod's Chip-8 Technical Reference](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM)
- [Chip-8 Wikipedia Page](https://en.wikipedia.org/wiki/CHIP-8)
- [How to write an emulator (CHIP-8 interpreter)](http://www.multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/)
- [Mastering CHIP-8](http://mattmik.com/files/chip8/mastering/chip8.html)
- [CHIP-8 Assembler and Emulator in GO](https://massung.github.io/CHIP-8/)

## License

MIT

[Chip-8]: https://en.wikipedia.org/wiki/CHIP-8
