__ZN23HGBilateralFilterInterpC1Ev:
0000000000108ef0	pushq	%rbp
0000000000108ef1	movq	%rsp, %rbp
0000000000108ef4	pushq	%r15
0000000000108ef6	pushq	%r14
0000000000108ef8	pushq	%rbx
0000000000108ef9	pushq	%rax
0000000000108efa	movq	%rdi, %rbx
0000000000108efd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000108f02	leaq	0x912377(%rip), %rax
0000000000108f09	movq	%rax, (%rbx)
0000000000108f0c	xorps	%xmm0, %xmm0
0000000000108f0f	movups	%xmm0, 0x198(%rbx)
0000000000108f16	movups	%xmm0, 0x1a8(%rbx)
0000000000108f1d	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000108f22	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000108f27	movq	%rax, %r14
0000000000108f2a	movq	%rax, %rdi
0000000000108f2d	callq	__ZN6HGNodeC1Ev                 ## HGNode::HGNode()
0000000000108f32	movq	%r14, 0x1b8(%rbx)
0000000000108f39	movq	$0x0, 0x1c0(%rbx)
0000000000108f44	movl	$0xa, 0x1c8(%rbx)
0000000000108f4e	movsd	0x2c115a(%rip), %xmm0
0000000000108f56	movsd	%xmm0, 0x1cc(%rbx)
0000000000108f5e	movb	$0x1, 0x1d4(%rbx)
0000000000108f65	movss	0x2bed53(%rip), %xmm0
0000000000108f6d	movlps	%xmm0, 0x1d8(%rbx)
0000000000108f74	addq	$0x8, %rsp
0000000000108f78	popq	%rbx
0000000000108f79	popq	%r14
0000000000108f7b	popq	%r15
0000000000108f7d	popq	%rbp
0000000000108f7e	retq
0000000000108f7f	movq	%rax, %r15
0000000000108f82	movq	%r14, %rdi
0000000000108f85	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000108f8a	movq	%rbx, %rdi
0000000000108f8d	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000108f92	movq	%r15, %rdi
0000000000108f95	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000108f9a	movq	%rax, %r15
0000000000108f9d	movq	%rbx, %rdi
0000000000108fa0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000108fa5	movq	%r15, %rdi
0000000000108fa8	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000108fad	nopl	(%rax)
