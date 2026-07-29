__ZN22OZChannelMoveableImageD2Ev:
0000000000339890	leaq	0x516359(%rip), %rax
0000000000339897	movq	%rax, (%rdi)
000000000033989a	leaq	0x5166cf(%rip), %rax
00000000003398a1	movq	%rax, 0x10(%rdi)
00000000003398a5	cmpb	$0x1, 0xa8(%rdi)
00000000003398ac	jne	__ZN25OZChanElementOrFootageRefD2Ev ## OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
00000000003398b2	movq	0xa0(%rdi), %rax
00000000003398b9	testq	%rax, %rax
00000000003398bc	je	0x3398d9
00000000003398be	pushq	%rbp
00000000003398bf	movq	%rsp, %rbp
00000000003398c2	pushq	%rbx
00000000003398c3	pushq	%rax
00000000003398c4	movq	(%rax), %rcx
00000000003398c7	movq	%rdi, %rbx
00000000003398ca	movq	%rax, %rdi
00000000003398cd	callq	*0x8(%rcx)
00000000003398d0	movq	%rbx, %rdi
00000000003398d3	addq	$0x8, %rsp
00000000003398d7	popq	%rbx
00000000003398d8	popq	%rbp
00000000003398d9	movq	$0x0, 0xa0(%rdi)
00000000003398e4	jmp	__ZN25OZChanElementOrFootageRefD2Ev ## OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
00000000003398e9	nopl	(%rax)
