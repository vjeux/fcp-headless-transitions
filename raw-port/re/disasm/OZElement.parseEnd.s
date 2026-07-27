__ZN9OZElement8parseEndER22PCSerializerReadStream:
000000000009e660	pushq	%rbp
000000000009e661	movq	%rsp, %rbp
000000000009e664	pushq	%r14
000000000009e666	pushq	%rbx
000000000009e667	movq	%rsi, %rbx
000000000009e66a	movq	%rdi, %r14
000000000009e66d	callq	__ZN15OZTransformNode8parseEndER22PCSerializerReadStream ## OZTransformNode::parseEnd(PCSerializerReadStream&)
000000000009e672	cmpq	$0x0, 0x3d8(%r14)
000000000009e67a	je	0x9e692
000000000009e67c	movq	0x3c8(%r14), %rax
000000000009e683	movq	0x10(%rax), %rax
000000000009e687	leaq	0x1978(%r14), %rcx
000000000009e68e	movq	%rcx, 0x18(%rax)
000000000009e692	cmpl	$0x2, 0x68(%rbx)
000000000009e696	ja	0x9e6b7
000000000009e698	movq	0x3680(%r14), %rax
000000000009e69f	addq	$0x3680, %r14                   ## imm = 0x3680
000000000009e6a6	movsd	0x66883a(%rip), %xmm0
000000000009e6ae	movq	%r14, %rdi
000000000009e6b1	callq	*0x308(%rax)
000000000009e6b7	movb	$0x1, %al
000000000009e6b9	popq	%rbx
000000000009e6ba	popq	%r14
000000000009e6bc	popq	%rbp
000000000009e6bd	retq
000000000009e6be	nop
