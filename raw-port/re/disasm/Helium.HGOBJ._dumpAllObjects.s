__ZN5HGOBJ15_dumpAllObjectsEv:
00000000001a0e40	pushq	%rbp
00000000001a0e41	movq	%rsp, %rbp
00000000001a0e44	cmpl	$0x4, __ZN5HGOBJ14__verboseLevelE(%rip) ## HGOBJ::__verboseLevel
00000000001a0e4b	setae	%al
00000000001a0e4e	popq	%rbp
00000000001a0e4f	retq
