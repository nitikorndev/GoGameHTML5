GOROOT=~/go

include $(GOROOT)/src/Make.inc

TARG=server
GOFILES=/src/*.go

include $(GOROOT)/src/Make.cmd
