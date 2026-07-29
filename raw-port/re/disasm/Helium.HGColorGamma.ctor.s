__ZN12HGColorGammaC2Ev:
00000000000f50b0	pushq	%rbp
00000000000f50b1	movq	%rsp, %rbp
00000000000f50b4	pushq	%r14
00000000000f50b6	pushq	%rbx
00000000000f50b7	movq	%rdi, %rbx
00000000000f50ba	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000f50bf	leaq	0x91e18a(%rip), %rax
00000000000f50c6	movq	%rax, (%rbx)
00000000000f50c9	movq	$0x0, 0x220(%rbx)
00000000000f50d4	xorps	%xmm0, %xmm0
00000000000f50d7	movaps	%xmm0, 0x1a0(%rbx)
00000000000f50de	movaps	%xmm0, 0x1b0(%rbx)
00000000000f50e5	movaps	%xmm0, 0x1c0(%rbx)
00000000000f50ec	movaps	%xmm0, 0x1d0(%rbx)
00000000000f50f3	movaps	%xmm0, 0x1e0(%rbx)
00000000000f50fa	movaps	%xmm0, 0x1f0(%rbx)
00000000000f5101	movaps	%xmm0, 0x200(%rbx)
00000000000f5108	movq	$0x0, 0x210(%rbx)
00000000000f5113	movaps	%xmm0, 0x230(%rbx)
00000000000f511a	movaps	%xmm0, 0x240(%rbx)
00000000000f5121	movaps	%xmm0, 0x250(%rbx)
00000000000f5128	movaps	%xmm0, 0x260(%rbx)
00000000000f512f	movaps	%xmm0, 0x270(%rbx)
00000000000f5136	movaps	%xmm0, 0x280(%rbx)
00000000000f513d	movaps	%xmm0, 0x290(%rbx)
00000000000f5144	movaps	%xmm0, 0x2a0(%rbx)
00000000000f514b	movaps	%xmm0, 0x2b0(%rbx)
00000000000f5152	movaps	%xmm0, 0x2c0(%rbx)
00000000000f5159	movaps	%xmm0, 0x2d0(%rbx)
00000000000f5160	movups	%xmm0, 0x2d9(%rbx)
00000000000f5167	movaps	%xmm0, 0x2f0(%rbx)
00000000000f516e	movw	$0x101, 0x2e9(%rbx)             ## imm = 0x101
00000000000f5177	movl	$0x10101, 0x494(%rbx)           ## imm = 0x10101
00000000000f5181	movsd	0x2da687(%rip), %xmm0
00000000000f5189	movsd	%xmm0, 0x484(%rbx)
00000000000f5191	movl	$0x400, 0x480(%rbx)             ## imm = 0x400
00000000000f519b	movabsq	$0x100000320, %rax              ## imm = 0x100000320
00000000000f51a5	movq	%rax, 0x48c(%rbx)
00000000000f51ac	movw	$0x0, 0x400(%rbx)
00000000000f51b5	movb	$0x0, 0x402(%rbx)
00000000000f51bc	movl	$0x1, 0x40c(%rbx)
00000000000f51c6	leaq	_HGRectInfinite(%rip), %rax
00000000000f51cd	movups	(%rax), %xmm0
00000000000f51d0	movups	%xmm0, 0x410(%rbx)
00000000000f51d7	movq	$0x0, 0x420(%rbx)
00000000000f51e2	movl	$0x0, 0x428(%rbx)
00000000000f51ec	movq	$0x0, 0x198(%rbx)
00000000000f51f7	movb	$0x0, 0x370(%rbx)
00000000000f51fe	movq	%rbx, %rdi
00000000000f5201	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5206	movb	$0x1, 0x2e9(%rbx)
00000000000f520d	movq	%rbx, %rdi
00000000000f5210	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f5215	movb	$0x1, 0x2e9(%rbx)
00000000000f521c	movss	0x2d2a9c(%rip), %xmm0
00000000000f5224	movaps	%xmm0, 0x380(%rbx)
00000000000f522b	movsd	0x2d2a7d(%rip), %xmm0
00000000000f5233	movaps	%xmm0, 0x390(%rbx)
00000000000f523a	movaps	0x2d582f(%rip), %xmm0
00000000000f5241	movaps	%xmm0, 0x3a0(%rbx)
00000000000f5248	movaps	0x2d4d91(%rip), %xmm0
00000000000f524f	movaps	%xmm0, 0x3b0(%rbx)
00000000000f5256	movq	%rbx, %rdi
00000000000f5259	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f525e	movb	$0x1, 0x2e9(%rbx)
00000000000f5265	movss	0x2d2a53(%rip), %xmm0
00000000000f526d	movaps	%xmm0, 0x3c0(%rbx)
00000000000f5274	movsd	0x2d2a34(%rip), %xmm0
00000000000f527c	movaps	%xmm0, 0x3d0(%rbx)
00000000000f5283	movaps	0x2d57e6(%rip), %xmm0
00000000000f528a	movaps	%xmm0, 0x3e0(%rbx)
00000000000f5291	movaps	0x2d4d48(%rip), %xmm0
00000000000f5298	movaps	%xmm0, 0x3f0(%rbx)
00000000000f529f	movq	%rbx, %rdi
00000000000f52a2	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f52a7	movb	$0x1, 0x2e9(%rbx)
00000000000f52ae	movq	$0x0, 0x404(%rbx)
00000000000f52b9	movaps	0x2d2980(%rip), %xmm0
00000000000f52c0	movaps	%xmm0, 0x300(%rbx)
00000000000f52c7	xorps	%xmm0, %xmm0
00000000000f52ca	movaps	%xmm0, 0x310(%rbx)
00000000000f52d1	movaps	%xmm0, 0x320(%rbx)
00000000000f52d8	movaps	%xmm0, 0x330(%rbx)
00000000000f52df	movaps	%xmm0, 0x340(%rbx)
00000000000f52e6	movaps	%xmm0, 0x350(%rbx)
00000000000f52ed	movaps	%xmm0, 0x360(%rbx)
00000000000f52f4	movb	$0x1, 0x370(%rbx)
00000000000f52fb	movq	%rbx, %rdi
00000000000f52fe	callq	__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv ## HGColorGamma::SetYCbCrBiasAndScale()
00000000000f5303	movq	$0x0, 0x498(%rbx)
00000000000f530e	popq	%rbx
00000000000f530f	popq	%r14
00000000000f5311	popq	%rbp
00000000000f5312	retq
00000000000f5313	movq	%rax, %r14
00000000000f5316	movq	%rbx, %rdi
00000000000f5319	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000f531e	movq	%r14, %rdi
00000000000f5321	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f5326	nopw	%cs:(%rax,%rax)
