__ZN22OZChannelMoveableImageD0Ev:
00000000003399c0	pushq	%rbp
00000000003399c1	movq	%rsp, %rbp
00000000003399c4	pushq	%rbx
00000000003399c5	pushq	%rax
00000000003399c6	movq	%rdi, %rbx
00000000003399c9	leaq	0x516220(%rip), %rax
00000000003399d0	movq	%rax, (%rdi)
00000000003399d3	leaq	0x516596(%rip), %rax
00000000003399da	movq	%rax, 0x10(%rdi)
00000000003399de	cmpb	$0x1, 0xa8(%rdi)
00000000003399e5	jne	0x339a04
00000000003399e7	movq	0xa0(%rbx), %rdi
00000000003399ee	testq	%rdi, %rdi
00000000003399f1	je	0x3399f9
00000000003399f3	movq	(%rdi), %rax
00000000003399f6	callq	*0x8(%rax)
00000000003399f9	movq	$0x0, 0xa0(%rbx)
0000000000339a04	movq	%rbx, %rdi
0000000000339a07	callq	__ZN25OZChanElementOrFootageRefD2Ev ## OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
0000000000339a0c	movq	%rbx, %rdi
0000000000339a0f	addq	$0x8, %rsp
0000000000339a13	popq	%rbx
0000000000339a14	popq	%rbp
0000000000339a15	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000339a1a	nopw	(%rax,%rax)
