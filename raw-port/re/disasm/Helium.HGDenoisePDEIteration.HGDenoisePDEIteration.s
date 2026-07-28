__ZN21HGDenoisePDEIterationC1Ev:
00000000001c2b00	pushq	%rbp
00000000001c2b01	movq	%rsp, %rbp
00000000001c2b04	pushq	%r14
00000000001c2b06	pushq	%rbx
00000000001c2b07	movq	%rdi, %rbx
00000000001c2b0a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001c2b0f	leaq	0x865bb2(%rip), %rax
00000000001c2b16	movq	%rax, (%rbx)
00000000001c2b19	movss	0x209623(%rip), %xmm0
00000000001c2b21	movq	%rbx, %rdi
00000000001c2b24	xorl	%esi, %esi
00000000001c2b26	movaps	%xmm0, %xmm1
00000000001c2b29	movaps	%xmm0, %xmm2
00000000001c2b2c	movaps	%xmm0, %xmm3
00000000001c2b2f	callq	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
00000000001c2b34	popq	%rbx
00000000001c2b35	popq	%r14
00000000001c2b37	popq	%rbp
00000000001c2b38	retq
00000000001c2b39	movq	%rax, %r14
00000000001c2b3c	movq	%rbx, %rdi
00000000001c2b3f	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001c2b44	movq	%r14, %rdi
00000000001c2b47	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c2b4c	nopl	(%rax)
