__ZN15PCSimplePolygon12closePolygonEv:
00000000000c3b46	movq	0x8(%rdi), %rax
00000000000c3b4a	movq	0x10(%rdi), %rcx
00000000000c3b4e	subq	%rax, %rcx
00000000000c3b51	cmpq	$0x11, %rcx
00000000000c3b55	jae	0xc3b5a
00000000000c3b57	xorl	%eax, %eax
00000000000c3b59	retq
00000000000c3b5a	pushq	%rbp
00000000000c3b5b	movq	%rsp, %rbp
00000000000c3b5e	subq	$0x10, %rsp
00000000000c3b62	movups	(%rax), %xmm0
00000000000c3b65	leaq	-0x10(%rbp), %rsi
00000000000c3b69	movaps	%xmm0, (%rsi)
00000000000c3b6c	callq	__ZN15PCSimplePolygon9addVertexE9PCVector2IdE ## PCSimplePolygon::addVertex(PCVector2<double>)
00000000000c3b71	addq	$0x10, %rsp
00000000000c3b75	popq	%rbp
00000000000c3b76	retq
00000000000c3b77	nop
