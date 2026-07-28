__ZN18HGComicColorStrokeC1Ev:
00000000001bc0d0	pushq	%rbp
00000000001bc0d1	movq	%rsp, %rbp
00000000001bc0d4	pushq	%rbx
00000000001bc0d5	pushq	%rax
00000000001bc0d6	movq	%rdi, %rbx
00000000001bc0d9	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001bc0de	leaq	0x86b58b(%rip), %rax
00000000001bc0e5	movq	%rax, (%rbx)
00000000001bc0e8	movl	$0x3f800000, 0x198(%rbx)        ## imm = 0x3F800000
00000000001bc0f2	orb	$0x6, 0x11(%rbx)
00000000001bc0f6	addq	$0x8, %rsp
00000000001bc0fa	popq	%rbx
00000000001bc0fb	popq	%rbp
00000000001bc0fc	retq
00000000001bc0fd	nopl	(%rax)
