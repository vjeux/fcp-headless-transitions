__ZN15HGComputeDeltaEC1Ev:
00000000000937e0	pushq	%rbp
00000000000937e1	movq	%rsp, %rbp
00000000000937e4	pushq	%r14
00000000000937e6	pushq	%rbx
00000000000937e7	movq	%rdi, %rbx
00000000000937ea	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000937ef	leaq	0x977bc2(%rip), %rax
00000000000937f6	movq	%rax, (%rbx)
00000000000937f9	movq	$0x0, 0x198(%rbx)
0000000000093804	movl	$0x0, 0x1a0(%rbx)
000000000009380e	movq	$0x0, 0x1a8(%rbx)
0000000000093819	movq	%rbx, %rdi
000000000009381c	movl	$0xc, %esi
0000000000093821	callq	__ZN6HGNode28SetSupportedFormatPrecisionsEj ## HGNode::SetSupportedFormatPrecisions(unsigned int)
0000000000093826	popq	%rbx
0000000000093827	popq	%r14
0000000000093829	popq	%rbp
000000000009382a	retq
000000000009382b	movq	%rax, %r14
000000000009382e	movq	0x1a8(%rbx), %rdi
0000000000093835	testq	%rdi, %rdi
0000000000093838	je	0x93840
000000000009383a	movq	(%rdi), %rax
000000000009383d	callq	*0x18(%rax)
0000000000093840	movq	%rbx, %rdi
0000000000093843	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000093848	movq	%r14, %rdi
000000000009384b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000093850	movq	%rax, %rdi
0000000000093853	callq	___clang_call_terminate
0000000000093858	nopl	(%rax,%rax)
