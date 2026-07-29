__ZN7OZCurveC2Edddd:
000000000001e494	pushq	%rbp
000000000001e495	movq	%rsp, %rbp
000000000001e498	pushq	%r15
000000000001e49a	pushq	%r14
000000000001e49c	pushq	%rbx
000000000001e49d	subq	$0x18, %rsp
000000000001e4a1	movsd	%xmm1, -0x28(%rbp)
000000000001e4a6	movsd	%xmm0, -0x20(%rbp)
000000000001e4ab	movq	%rdi, %r14
000000000001e4ae	leaq	0xb619b(%rip), %rax
000000000001e4b5	movq	%rax, (%rdi)
000000000001e4b8	leaq	0x10(%rdi), %rbx
000000000001e4bc	movq	%rbx, %rdi
000000000001e4bf	movaps	%xmm3, %xmm0
000000000001e4c2	callq	__ZN14OZConstantNodeC1Ed        ## OZConstantNode::OZConstantNode(double)
000000000001e4c7	leaq	0x28(%r14), %r15
000000000001e4cb	movq	%r15, %rdi
000000000001e4ce	movq	%r14, %rsi
000000000001e4d1	callq	__ZN12OZSplineNodeC1EP7OZCurve  ## OZSplineNode::OZSplineNode(OZCurve*)
000000000001e4d6	movq	$0x0, 0x68(%r14)
000000000001e4de	movl	$0x18, %edi
000000000001e4e3	callq	0xace4c                         ## symbol stub for: __Znwm
000000000001e4e8	xorps	%xmm0, %xmm0
000000000001e4eb	movups	%xmm0, (%rax)
000000000001e4ee	xorl	%ecx, %ecx
000000000001e4f0	movq	%rcx, 0x10(%rax)
000000000001e4f4	movq	%rax, 0x70(%r14)
000000000001e4f8	movsd	-0x20(%rbp), %xmm1
000000000001e4fd	movsd	%xmm1, 0x78(%r14)
000000000001e503	movsd	-0x28(%rbp), %xmm1
000000000001e508	movsd	%xmm1, 0x80(%r14)
000000000001e511	movq	%rbx, 0x8(%r14)
000000000001e515	movl	$0x0, 0xa8(%r14)
000000000001e520	movw	$0x1, 0x88(%r14)
000000000001e52a	movq	%rcx, 0x90(%r14)
000000000001e531	movb	$0x1, 0x8a(%r14)
000000000001e539	movups	%xmm0, 0x98(%r14)
000000000001e541	addq	$0x18, %rsp
000000000001e545	popq	%rbx
000000000001e546	popq	%r14
000000000001e548	popq	%r15
000000000001e54a	popq	%rbp
000000000001e54b	retq
000000000001e54c	movq	%rax, %r14
000000000001e54f	movq	%r15, %rdi
000000000001e552	callq	__ZN12OZSplineNodeD1Ev          ## OZSplineNode::~OZSplineNode()
000000000001e557	jmp	0x1e55c
000000000001e559	movq	%rax, %r14
000000000001e55c	movq	%rbx, %rdi
000000000001e55f	callq	__ZN14OZConstantNodeD1Ev        ## OZConstantNode::~OZConstantNode()
000000000001e564	movq	%r14, %rdi
000000000001e567	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
