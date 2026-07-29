__ZN7OZCurveC2ERKS_b:
000000000001e56c	pushq	%rbp
000000000001e56d	movq	%rsp, %rbp
000000000001e570	pushq	%r15
000000000001e572	pushq	%r14
000000000001e574	pushq	%r13
000000000001e576	pushq	%r12
000000000001e578	pushq	%rbx
000000000001e579	subq	$0x18, %rsp
000000000001e57d	movl	%edx, -0x34(%rbp)
000000000001e580	movq	%rsi, %r12
000000000001e583	movq	%rdi, %r15
000000000001e586	leaq	0xb60c3(%rip), %rax
000000000001e58d	movq	%rax, (%rdi)
000000000001e590	leaq	0x10(%rdi), %rbx
000000000001e594	xorps	%xmm0, %xmm0
000000000001e597	movq	%rbx, %rdi
000000000001e59a	callq	__ZN14OZConstantNodeC1Ed        ## OZConstantNode::OZConstantNode(double)
000000000001e59f	leaq	0x28(%r15), %rdi
000000000001e5a3	movq	%rdi, -0x30(%rbp)
000000000001e5a7	movq	%r15, %rsi
000000000001e5aa	callq	__ZN12OZSplineNodeC1EP7OZCurve  ## OZSplineNode::OZSplineNode(OZCurve*)
000000000001e5af	movq	$0x0, 0x68(%r15)
000000000001e5b7	xorps	%xmm0, %xmm0
000000000001e5ba	movups	%xmm0, 0x98(%r15)
000000000001e5c2	movq	0xa0(%r12), %r14
000000000001e5ca	cmpb	$0x0, 0x2c(%r14)
000000000001e5cf	jne	0x1e5ec
000000000001e5d1	movl	$0x30, %edi
000000000001e5d6	callq	0xace4c                         ## symbol stub for: __Znwm
000000000001e5db	movq	%rax, %r13
000000000001e5de	movq	%rax, %rdi
000000000001e5e1	movq	%r14, %rsi
000000000001e5e4	callq	__ZN13OZSplineStateC1ERKS_      ## OZSplineState::OZSplineState(OZSplineState const&)
000000000001e5e9	movq	%r13, %r14
000000000001e5ec	movq	%r14, 0xa0(%r15)
000000000001e5f3	movl	$0x18, %edi
000000000001e5f8	callq	0xace4c                         ## symbol stub for: __Znwm
000000000001e5fd	xorps	%xmm0, %xmm0
000000000001e600	movups	%xmm0, (%rax)
000000000001e603	movq	$0x0, 0x10(%rax)
000000000001e60b	movq	%rax, 0x70(%r15)
000000000001e60f	cmpb	$0x0, -0x34(%rbp)
000000000001e613	je	0x1e620
000000000001e615	movq	%r15, %rdi
000000000001e618	movq	%r12, %rsi
000000000001e61b	callq	__ZNK7OZCurve9cloneTreeERKS_    ## OZCurve::cloneTree(OZCurve const&) const
000000000001e620	movups	0x78(%r12), %xmm0
000000000001e626	movups	%xmm0, 0x78(%r15)
000000000001e62b	leaq	0x10(%r12), %rsi
000000000001e630	movq	%rbx, %rdi
000000000001e633	callq	__ZN14OZConstantNodeaSERKS_     ## OZConstantNode::operator=(OZConstantNode const&)
000000000001e638	leaq	0x28(%r12), %rsi
000000000001e63d	movq	-0x30(%rbp), %rdi
000000000001e641	callq	__ZN12OZSplineNodeaSERKS_       ## OZSplineNode::operator=(OZSplineNode const&)
000000000001e646	movq	0x68(%r12), %r13
000000000001e64b	testq	%r13, %r13
000000000001e64e	je	0x1e66c
000000000001e650	movl	$0x98, %edi
000000000001e655	callq	0xace4c                         ## symbol stub for: __Znwm
000000000001e65a	movq	%rax, %r14
000000000001e65d	movq	%rax, %rdi
000000000001e660	movq	%r13, %rsi
000000000001e663	callq	__ZN15OZRecordingNodeC1ERKS_    ## OZRecordingNode::OZRecordingNode(OZRecordingNode const&)
000000000001e668	movq	%r14, 0x68(%r15)
000000000001e66c	movb	0x88(%r12), %al
000000000001e674	movb	%al, 0x88(%r15)
000000000001e67b	movb	0x89(%r12), %al
000000000001e683	movb	%al, 0x89(%r15)
000000000001e68a	movq	$0x0, 0x90(%r15)
000000000001e695	movb	0x8a(%r12), %al
000000000001e69d	movb	%al, 0x8a(%r15)
000000000001e6a4	movl	0xa8(%r12), %eax
000000000001e6ac	movl	%eax, 0xa8(%r15)
000000000001e6b3	testl	%eax, %eax
000000000001e6b5	je	0x1e6c4
000000000001e6b7	movq	-0x30(%rbp), %rbx
000000000001e6bb	cmpl	$0x1, %eax
000000000001e6be	je	0x1e6c4
000000000001e6c0	movq	0x68(%r15), %rbx
000000000001e6c4	movq	%rbx, 0x8(%r15)
000000000001e6c8	addq	$0x18, %rsp
000000000001e6cc	popq	%rbx
000000000001e6cd	popq	%r12
000000000001e6cf	popq	%r13
000000000001e6d1	popq	%r14
000000000001e6d3	popq	%r15
000000000001e6d5	popq	%rbp
000000000001e6d6	retq
000000000001e6d7	movq	%rax, %r15
000000000001e6da	movq	%r13, %rdi
000000000001e6dd	jmp	0x1e6e5
000000000001e6df	movq	%rax, %r15
000000000001e6e2	movq	%r14, %rdi
000000000001e6e5	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000001e6ea	jmp	0x1e6f4
000000000001e6ec	movq	%rax, %r15
000000000001e6ef	jmp	0x1e6fd
000000000001e6f1	movq	%rax, %r15
000000000001e6f4	movq	-0x30(%rbp), %rdi
000000000001e6f8	callq	__ZN12OZSplineNodeD1Ev          ## OZSplineNode::~OZSplineNode()
000000000001e6fd	movq	%rbx, %rdi
000000000001e700	callq	__ZN14OZConstantNodeD1Ev        ## OZConstantNode::~OZConstantNode()
000000000001e705	movq	%r15, %rdi
000000000001e708	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000001e70d	nop
