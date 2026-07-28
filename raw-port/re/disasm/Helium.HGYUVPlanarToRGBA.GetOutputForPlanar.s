__ZN17HGYUVPlanarToRGBA18GetOutputForPlanarEP10HGRenderer:
00000000000e4d60	pushq	%rbp
00000000000e4d61	movq	%rsp, %rbp
00000000000e4d64	pushq	%r15
00000000000e4d66	pushq	%r14
00000000000e4d68	pushq	%r13
00000000000e4d6a	pushq	%r12
00000000000e4d6c	pushq	%rbx
00000000000e4d6d	subq	$0x18, %rsp
00000000000e4d71	movq	%rsi, %rbx
00000000000e4d74	movq	%rdi, %r14
00000000000e4d77	movq	%rsi, %rdi
00000000000e4d7a	movq	%r14, %rsi
00000000000e4d7d	xorl	%edx, %edx
00000000000e4d7f	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000e4d84	movq	%rax, %r15
00000000000e4d87	movq	%rbx, %rdi
00000000000e4d8a	movq	%r14, %rsi
00000000000e4d8d	movl	$0x1, %edx
00000000000e4d92	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000e4d97	movq	%rax, -0x38(%rbp)
00000000000e4d9b	cmpb	$0x1, 0x1b1(%r14)
00000000000e4da3	movq	%r15, -0x30(%rbp)
00000000000e4da7	jne	0xe4dbe
00000000000e4da9	movq	%rbx, %rdi
00000000000e4dac	movq	%r14, %rsi
00000000000e4daf	movl	$0x2, %edx
00000000000e4db4	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000e4db9	movq	%rax, %r12
00000000000e4dbc	jmp	0xe4dc1
00000000000e4dbe	xorl	%r12d, %r12d
00000000000e4dc1	movl	0x1a0(%r14), %r15d
00000000000e4dc8	movl	0x1a4(%r14), %r13d
00000000000e4dcf	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000e4dd4	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e4dd9	movq	%rax, %rbx
00000000000e4ddc	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000e4de1	movq	%rax, %rdi
00000000000e4de4	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000e4de9	cmpl	$0x1, %r15d
00000000000e4ded	je	0xe4e29
00000000000e4def	cmpl	$0x2, %r15d
00000000000e4df3	jne	0xe4e59
00000000000e4df5	cmpl	$0x2, %r13d
00000000000e4df9	je	0xe4e8d
00000000000e4dff	testl	%r13d, %r13d
00000000000e4e02	jne	0xe4ecf
00000000000e4e08	testq	%r12, %r12
00000000000e4e0b	movq	-0x30(%rbp), %r15
00000000000e4e0f	je	0xe4f53
00000000000e4e15	movq	%rbx, %rdi
00000000000e4e18	callq	__ZN27HgcYUV444TriPlanar_601ToRGBC2Ev ## HgcYUV444TriPlanar_601ToRGB::HgcYUV444TriPlanar_601ToRGB()
00000000000e4e1d	leaq	0x929f6c(%rip), %rax
00000000000e4e24	jmp	0xe4ffc
00000000000e4e29	cmpl	$0x2, %r13d
00000000000e4e2d	je	0xe4eae
00000000000e4e2f	testl	%r13d, %r13d
00000000000e4e32	jne	0xe4ef0
00000000000e4e38	testq	%r12, %r12
00000000000e4e3b	movq	-0x30(%rbp), %r15
00000000000e4e3f	je	0xe4f67
00000000000e4e45	movq	%rbx, %rdi
00000000000e4e48	callq	__ZN27HgcYUV422TriPlanar_601ToRGBC2Ev ## HgcYUV422TriPlanar_601ToRGB::HgcYUV422TriPlanar_601ToRGB()
00000000000e4e4d	leaq	0x92ad4c(%rip), %rax
00000000000e4e54	jmp	0xe4ffc
00000000000e4e59	cmpl	$0x2, %r13d
00000000000e4e5d	je	0xe4f11
00000000000e4e63	testl	%r13d, %r13d
00000000000e4e66	jne	0xe4f32
00000000000e4e6c	testq	%r12, %r12
00000000000e4e6f	movq	-0x30(%rbp), %r15
00000000000e4e73	je	0xe4fa5
00000000000e4e79	movq	%rbx, %rdi
00000000000e4e7c	callq	__ZN27HgcYUV420TriPlanar_601ToRGBC2Ev ## HgcYUV420TriPlanar_601ToRGB::HgcYUV420TriPlanar_601ToRGB()
00000000000e4e81	leaq	0x92bb28(%rip), %rax
00000000000e4e88	jmp	0xe4ffc
00000000000e4e8d	testq	%r12, %r12
00000000000e4e90	je	0xe4f7b
00000000000e4e96	movq	%rbx, %rdi
00000000000e4e99	callq	__ZN28HgcYUV444TriPlanar_2020ToRGBC2Ev ## HgcYUV444TriPlanar_2020ToRGB::HgcYUV444TriPlanar_2020ToRGB()
00000000000e4e9e	movq	-0x30(%rbp), %r15
00000000000e4ea2	leaq	0x92a397(%rip), %rax
00000000000e4ea9	jmp	0xe4ffc
00000000000e4eae	testq	%r12, %r12
00000000000e4eb1	je	0xe4f90
00000000000e4eb7	movq	%rbx, %rdi
00000000000e4eba	callq	__ZN28HgcYUV422TriPlanar_2020ToRGBC2Ev ## HgcYUV422TriPlanar_2020ToRGB::HgcYUV422TriPlanar_2020ToRGB()
00000000000e4ebf	movq	-0x30(%rbp), %r15
00000000000e4ec3	leaq	0x92b186(%rip), %rax
00000000000e4eca	jmp	0xe4ffc
00000000000e4ecf	testq	%r12, %r12
00000000000e4ed2	movq	-0x30(%rbp), %r15
00000000000e4ed6	je	0xe4fb6
00000000000e4edc	movq	%rbx, %rdi
00000000000e4edf	callq	__ZN27HgcYUV444TriPlanar_709ToRGBC2Ev ## HgcYUV444TriPlanar_709ToRGB::HgcYUV444TriPlanar_709ToRGB()
00000000000e4ee4	leaq	0x92a805(%rip), %rax
00000000000e4eeb	jmp	0xe4ffc
00000000000e4ef0	testq	%r12, %r12
00000000000e4ef3	movq	-0x30(%rbp), %r15
00000000000e4ef7	je	0xe4fc7
00000000000e4efd	movq	%rbx, %rdi
00000000000e4f00	callq	__ZN27HgcYUV422TriPlanar_709ToRGBC2Ev ## HgcYUV422TriPlanar_709ToRGB::HgcYUV422TriPlanar_709ToRGB()
00000000000e4f05	leaq	0x92b5f4(%rip), %rax
00000000000e4f0c	jmp	0xe4ffc
00000000000e4f11	testq	%r12, %r12
00000000000e4f14	je	0xe4fd8
00000000000e4f1a	movq	%rbx, %rdi
00000000000e4f1d	callq	__ZN28HgcYUV420TriPlanar_2020ToRGBC2Ev ## HgcYUV420TriPlanar_2020ToRGB::HgcYUV420TriPlanar_2020ToRGB()
00000000000e4f22	movq	-0x30(%rbp), %r15
00000000000e4f26	leaq	0x92bf33(%rip), %rax
00000000000e4f2d	jmp	0xe4ffc
00000000000e4f32	testq	%r12, %r12
00000000000e4f35	movq	-0x30(%rbp), %r15
00000000000e4f39	je	0xe4fed
00000000000e4f3f	movq	%rbx, %rdi
00000000000e4f42	callq	__ZN27HgcYUV420TriPlanar_709ToRGBC2Ev ## HgcYUV420TriPlanar_709ToRGB::HgcYUV420TriPlanar_709ToRGB()
00000000000e4f47	leaq	0x92c3c2(%rip), %rax
00000000000e4f4e	jmp	0xe4ffc
00000000000e4f53	movq	%rbx, %rdi
00000000000e4f56	callq	__ZN26HgcYUV444BiPlanar_601ToRGBC2Ev ## HgcYUV444BiPlanar_601ToRGB::HgcYUV444BiPlanar_601ToRGB()
00000000000e4f5b	leaq	0x92a086(%rip), %rax
00000000000e4f62	jmp	0xe4ffc
00000000000e4f67	movq	%rbx, %rdi
00000000000e4f6a	callq	__ZN26HgcYUV422BiPlanar_601ToRGBC2Ev ## HgcYUV422BiPlanar_601ToRGB::HgcYUV422BiPlanar_601ToRGB()
00000000000e4f6f	leaq	0x92ae82(%rip), %rax
00000000000e4f76	jmp	0xe4ffc
00000000000e4f7b	movq	%rbx, %rdi
00000000000e4f7e	callq	__ZN27HgcYUV444BiPlanar_2020ToRGBC2Ev ## HgcYUV444BiPlanar_2020ToRGB::HgcYUV444BiPlanar_2020ToRGB()
00000000000e4f83	movq	-0x30(%rbp), %r15
00000000000e4f87	leaq	0x92a50a(%rip), %rax
00000000000e4f8e	jmp	0xe4ffc
00000000000e4f90	movq	%rbx, %rdi
00000000000e4f93	callq	__ZN27HgcYUV422BiPlanar_2020ToRGBC2Ev ## HgcYUV422BiPlanar_2020ToRGB::HgcYUV422BiPlanar_2020ToRGB()
00000000000e4f98	movq	-0x30(%rbp), %r15
00000000000e4f9c	leaq	0x92b305(%rip), %rax
00000000000e4fa3	jmp	0xe4ffc
00000000000e4fa5	movq	%rbx, %rdi
00000000000e4fa8	callq	__ZN26HgcYUV420BiPlanar_601ToRGBC2Ev ## HgcYUV420BiPlanar_601ToRGB::HgcYUV420BiPlanar_601ToRGB()
00000000000e4fad	leaq	0x92bc54(%rip), %rax
00000000000e4fb4	jmp	0xe4ffc
00000000000e4fb6	movq	%rbx, %rdi
00000000000e4fb9	callq	__ZN26HgcYUV444BiPlanar_709ToRGBC2Ev ## HgcYUV444BiPlanar_709ToRGB::HgcYUV444BiPlanar_709ToRGB()
00000000000e4fbe	leaq	0x92a983(%rip), %rax
00000000000e4fc5	jmp	0xe4ffc
00000000000e4fc7	movq	%rbx, %rdi
00000000000e4fca	callq	__ZN26HgcYUV422BiPlanar_709ToRGBC2Ev ## HgcYUV422BiPlanar_709ToRGB::HgcYUV422BiPlanar_709ToRGB()
00000000000e4fcf	leaq	0x92b782(%rip), %rax
00000000000e4fd6	jmp	0xe4ffc
00000000000e4fd8	movq	%rbx, %rdi
00000000000e4fdb	callq	__ZN27HgcYUV420BiPlanar_2020ToRGBC2Ev ## HgcYUV420BiPlanar_2020ToRGB::HgcYUV420BiPlanar_2020ToRGB()
00000000000e4fe0	movq	-0x30(%rbp), %r15
00000000000e4fe4	leaq	0x92c0cd(%rip), %rax
00000000000e4feb	jmp	0xe4ffc
00000000000e4fed	movq	%rbx, %rdi
00000000000e4ff0	callq	__ZN26HgcYUV420BiPlanar_709ToRGBC2Ev ## HgcYUV420BiPlanar_709ToRGB::HgcYUV420BiPlanar_709ToRGB()
00000000000e4ff5	leaq	0x92c56c(%rip), %rax
00000000000e4ffc	movq	%rax, (%rbx)
00000000000e4fff	movq	%rbx, %rdi
00000000000e5002	xorl	%esi, %esi
00000000000e5004	movq	%r15, %rdx
00000000000e5007	callq	*0x78(%rax)
00000000000e500a	movq	(%rbx), %rax
00000000000e500d	movq	%rbx, %rdi
00000000000e5010	movl	$0x1, %esi
00000000000e5015	movq	-0x38(%rbp), %rdx
00000000000e5019	callq	*0x78(%rax)
00000000000e501c	testq	%r12, %r12
00000000000e501f	je	0xe5032
00000000000e5021	movq	(%rbx), %rax
00000000000e5024	movq	%rbx, %rdi
00000000000e5027	movl	$0x2, %esi
00000000000e502c	movq	%r12, %rdx
00000000000e502f	callq	*0x78(%rax)
00000000000e5032	testq	%r15, %r15
00000000000e5035	je	0xe506f
00000000000e5037	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000e503e	leaq	__ZTI14HGBitmapLoader(%rip), %rdx ## typeinfo for HGBitmapLoader
00000000000e5045	xorl	%r12d, %r12d
00000000000e5048	movq	%r15, %rdi
00000000000e504b	xorl	%ecx, %ecx
00000000000e504d	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000e5052	testq	%rax, %rax
00000000000e5055	je	0xe5072
00000000000e5057	movq	%rax, %rdi
00000000000e505a	callq	__ZNK14HGBitmapLoader15GetBitmapFormatEv ## HGBitmapLoader::GetBitmapFormat() const
00000000000e505f	movl	%eax, %edi
00000000000e5061	callq	__ZN13HGFormatUtils13bytesPerPixelE8HGFormat ## HGFormatUtils::bytesPerPixel(HGFormat)
00000000000e5066	cmpl	$0x2, %eax
00000000000e5069	sete	%r12b
00000000000e506d	jmp	0xe5072
00000000000e506f	xorl	%r12d, %r12d
00000000000e5072	movl	0x1a8(%r14), %ecx
00000000000e5079	movl	0x1b4(%r14), %eax
00000000000e5080	leal	-0x3(%rcx), %edx
00000000000e5083	cmpl	$0x3, %edx
00000000000e5086	ja	0xe50dd
00000000000e5088	cmpl	$0x6, %ecx
00000000000e508b	sete	%dl
00000000000e508e	andl	$0x6, %ecx
00000000000e5091	cmpl	$0x4, %ecx
00000000000e5094	sete	%cl
00000000000e5097	orb	%dl, %r12b
00000000000e509a	orb	%cl, %r12b
00000000000e509d	movss	0x2ea12f(%rip), %xmm0
00000000000e50a5	movss	%xmm0, -0x38(%rbp)
00000000000e50aa	movss	0x2ea11e(%rip), %xmm0
00000000000e50b2	movss	%xmm0, -0x30(%rbp)
00000000000e50b7	cmpb	$0x1, %r12b
00000000000e50bb	jne	0xe5110
00000000000e50bd	xorl	%ecx, %ecx
00000000000e50bf	testl	%eax, %eax
00000000000e50c1	sete	%cl
00000000000e50c4	leaq	0x2ea115(%rip), %rax
00000000000e50cb	movss	(%rax,%rcx,4), %xmm0
00000000000e50d0	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
00000000000e50d4	divps	0x2ea0e5(%rip), %xmm0
00000000000e50db	jmp	0xe5121
00000000000e50dd	xorps	%xmm0, %xmm0
00000000000e50e0	movss	%xmm0, -0x38(%rbp)
00000000000e50e5	movss	0x2e2bdf(%rip), %xmm0
00000000000e50ed	movss	%xmm0, -0x30(%rbp)
00000000000e50f2	cmpl	$0x1, %ecx
00000000000e50f5	jne	0xe511a
00000000000e50f7	xorl	%ecx, %ecx
00000000000e50f9	testl	%eax, %eax
00000000000e50fb	sete	%cl
00000000000e50fe	leaq	0x2ea0d3(%rip), %rax
00000000000e5105	movss	(%rax,%rcx,4), %xmm0
00000000000e510a	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
00000000000e510e	jmp	0xe5121
00000000000e5110	movsd	0x2ea098(%rip), %xmm0
00000000000e5118	jmp	0xe5121
00000000000e511a	movaps	0x2e4f8f(%rip), %xmm0
00000000000e5121	movq	(%rbx), %rax
00000000000e5124	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000000e5128	movss	0x2e2b90(%rip), %xmm3
00000000000e5130	movq	%rbx, %rdi
00000000000e5133	xorl	%esi, %esi
00000000000e5135	movaps	%xmm1, %xmm2
00000000000e5138	callq	*0x60(%rax)
00000000000e513b	movq	(%rbx), %rax
00000000000e513e	xorps	%xmm3, %xmm3
00000000000e5141	movq	%rbx, %rdi
00000000000e5144	movl	$0x1, %esi
00000000000e5149	movss	-0x38(%rbp), %xmm0
00000000000e514e	movss	-0x30(%rbp), %xmm1
00000000000e5153	movaps	%xmm1, %xmm2
00000000000e5156	callq	*0x60(%rax)
00000000000e5159	movq	%rbx, %rax
00000000000e515c	addq	$0x18, %rsp
00000000000e5160	popq	%rbx
00000000000e5161	popq	%r12
00000000000e5163	popq	%r13
00000000000e5165	popq	%r14
00000000000e5167	popq	%r15
00000000000e5169	popq	%rbp
00000000000e516a	retq
00000000000e516b	jmp	0xe518d
00000000000e516d	jmp	0xe518d
00000000000e516f	jmp	0xe518d
00000000000e5171	jmp	0xe518d
00000000000e5173	jmp	0xe518d
00000000000e5175	jmp	0xe518d
00000000000e5177	jmp	0xe518d
00000000000e5179	jmp	0xe518d
00000000000e517b	jmp	0xe518d
00000000000e517d	jmp	0xe518d
00000000000e517f	jmp	0xe518d
00000000000e5181	jmp	0xe518d
00000000000e5183	jmp	0xe518d
00000000000e5185	jmp	0xe518d
00000000000e5187	jmp	0xe518d
00000000000e5189	jmp	0xe518d
00000000000e518b	jmp	0xe518d
00000000000e518d	movq	%rax, %r14
00000000000e5190	movq	%rbx, %rdi
00000000000e5193	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e5198	movq	%r14, %rdi
00000000000e519b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
