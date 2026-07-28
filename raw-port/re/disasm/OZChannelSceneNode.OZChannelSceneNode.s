__ZN18OZChannelSceneNodeC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj:
00000000002138a0	pushq	%rbp
00000000002138a1	movq	%rsp, %rbp
00000000002138a4	pushq	%rbx
00000000002138a5	pushq	%rax
00000000002138a6	movq	%rdi, %rbx
00000000002138a9	callq	__ZN19OZChannelObjectRootC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZChannelObjectRoot::OZChannelObjectRoot(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
00000000002138ae	leaq	0x633f6b(%rip), %rax
00000000002138b5	movq	%rax, (%rbx)
00000000002138b8	leaq	0x634301(%rip), %rax
00000000002138bf	movq	%rax, 0x10(%rbx)
00000000002138c3	movq	$0x0, 0x100(%rbx)
00000000002138ce	addq	$0x8, %rsp
00000000002138d2	popq	%rbx
00000000002138d3	popq	%rbp
00000000002138d4	retq
00000000002138d5	nopw	%cs:(%rax,%rax)
