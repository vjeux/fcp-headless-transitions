__ZN23OZProcessControlWrapperC1Ev:
00000000004db020	pushq	%rbp
00000000004db021	movq	%rsp, %rbp
00000000004db024	pushq	%rbx
00000000004db025	pushq	%rax
00000000004db026	movq	%rdi, %rbx
00000000004db029	callq	__ZN16OZProcessControlC2Ev      ## OZProcessControl::OZProcessControl()
00000000004db02e	leaq	0x39c04b(%rip), %rax
00000000004db035	movq	%rax, (%rbx)
00000000004db038	movq	$0x0, 0x38(%rbx)
00000000004db040	addq	$0x8, %rsp
00000000004db044	popq	%rbx
00000000004db045	popq	%rbp
00000000004db046	retq
00000000004db047	nopw	(%rax,%rax)
