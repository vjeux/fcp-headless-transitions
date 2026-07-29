__ZN28FFCinematicManagerDestructorD1Ev:
000000000038acc0	pushq	%rbp
000000000038acc1	movq	%rsp, %rbp
000000000038acc4	movq	__ZL24sDefaultCinematicManager(%rip), %rdi ## sDefaultCinematicManager
000000000038accb	callq	*0x1562a37(%rip)                ## literal pool symbol address: _objc_release
000000000038acd1	movq	$0x0, __ZL24sDefaultCinematicManager(%rip) ## sDefaultCinematicManager
000000000038acdc	popq	%rbp
000000000038acdd	retq
000000000038acde	movq	%rax, %rdi
000000000038ace1	callq	___clang_call_terminate
000000000038ace6	nopw	%cs:(%rax,%rax)
