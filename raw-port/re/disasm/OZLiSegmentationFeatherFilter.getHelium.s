__ZN29OZLiSegmentationFeatherFilter9getHeliumER7LiAgent:
0000000000424f70	pushq	%rbp
0000000000424f71	movq	%rsp, %rbp
0000000000424f74	pushq	%r15
0000000000424f76	pushq	%r14
0000000000424f78	pushq	%r13
0000000000424f7a	pushq	%r12
0000000000424f7c	pushq	%rbx
0000000000424f7d	subq	$0x58, %rsp
0000000000424f81	movq	%rsi, %r12
0000000000424f84	movq	%rdi, %rbx
0000000000424f87	movq	0x10(%rsi), %rax
0000000000424f8b	leaq	-0x30(%rbp), %rdi
0000000000424f8f	movq	%rdx, %rsi
0000000000424f92	movq	%rax, %rdx
0000000000424f95	callq	0x6debb0                        ## symbol stub for: __ZN7LiAgent9getHeliumEP13LiImageSource
0000000000424f9a	movq	-0x30(%rbp), %r15
0000000000424f9e	movq	%r15, (%rbx)
0000000000424fa1	testq	%r15, %r15
0000000000424fa4	je	0x424faf
0000000000424fa6	movq	(%r15), %rax
0000000000424fa9	movq	%r15, %rdi
0000000000424fac	callq	*0x10(%rax)
0000000000424faf	movq	0x40(%r12), %rax
0000000000424fb4	movq	%rax, -0x60(%rbp)
0000000000424fb8	movups	0x30(%r12), %xmm0
0000000000424fbe	movaps	%xmm0, -0x70(%rbp)
0000000000424fc2	movq	0x28(%r12), %rdi
0000000000424fc7	callq	__ZNK11OZImageMask19isUsingSegmentationEv ## OZImageMask::isUsingSegmentation() const
0000000000424fcc	testb	%al, %al
0000000000424fce	je	0x4251b2
0000000000424fd4	movq	0x28(%r12), %rdi
0000000000424fd9	callq	__ZN11OZImageMask21hasSegmentationResultEv ## OZImageMask::hasSegmentationResult()
0000000000424fde	testb	%al, %al
0000000000424fe0	je	0x4251b2
0000000000424fe6	movl	$0x200, %edi                    ## imm = 0x200
0000000000424feb	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
0000000000424ff0	movq	%rax, %r14
0000000000424ff3	movq	%rax, %rdi
0000000000424ff6	callq	__ZN25HgcCopyMaskRGBToMaskAlphaC2Ev ## HgcCopyMaskRGBToMaskAlpha::HgcCopyMaskRGBToMaskAlpha()
0000000000424ffb	leaq	0x43cafe(%rip), %rax
0000000000425002	movq	%rax, (%r14)
0000000000425005	movq	%r14, %rdi
0000000000425008	xorl	%esi, %esi
000000000042500a	movq	%r15, %rdx
000000000042500d	callq	0x6de9f4                        ## symbol stub for: __ZN6HGNode8SetInputEiPS_
0000000000425012	movq	(%r14), %rax
0000000000425015	movq	%r14, %rdi
0000000000425018	movl	$0x1, %esi
000000000042501d	movl	$0x2000, %edx                   ## imm = 0x2000
0000000000425022	callq	*0x88(%rax)
0000000000425028	cmpq	%r14, %r15
000000000042502b	je	0x42504a
000000000042502d	testq	%r15, %r15
0000000000425030	je	0x42503b
0000000000425032	movq	(%r15), %rax
0000000000425035	movq	%r15, %rdi
0000000000425038	callq	*0x18(%rax)
000000000042503b	movq	%r14, (%rbx)
000000000042503e	movq	(%r14), %rax
0000000000425041	movq	%r14, %rdi
0000000000425044	callq	*0x10(%rax)
0000000000425047	movq	%r14, %r15
000000000042504a	movl	$0x1908, %edi                   ## imm = 0x1908
000000000042504f	addq	0x28(%r12), %rdi
0000000000425054	leaq	-0x70(%rbp), %rsi
0000000000425058	xorps	%xmm0, %xmm0
000000000042505b	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000425060	movaps	%xmm0, -0x50(%rbp)
0000000000425064	addq	$0x30, %r12
0000000000425068	leaq	-0x80(%rbp), %rdi
000000000042506c	movq	%r12, %rsi
000000000042506f	callq	__ZNK14OZRenderParams13getResolutionEv ## OZRenderParams::getResolution() const
0000000000425074	movapd	0x2e1d94(%rip), %xmm0
000000000042507c	andpd	-0x50(%rbp), %xmm0
0000000000425081	movsd	0x2e1e47(%rip), %xmm1
0000000000425089	ucomisd	%xmm0, %xmm1
000000000042508d	jbe	0x425097
000000000042508f	xorl	%r12d, %r12d
0000000000425092	jmp	0x425119
0000000000425097	movsd	-0x80(%rbp), %xmm0
000000000042509c	movsd	%xmm0, -0x38(%rbp)
00000000004250a1	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000004250a6	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
00000000004250ab	movq	%rax, %r12
00000000004250ae	movq	%rax, %rdi
00000000004250b1	callq	0x6def40                        ## symbol stub for: __ZN8HFeatherC1Ev
00000000004250b6	movaps	-0x50(%rbp), %xmm0
00000000004250ba	cvtsd2ss	%xmm0, %xmm0
00000000004250be	movsd	-0x38(%rbp), %xmm1
00000000004250c3	cvtsd2ss	%xmm1, %xmm1
00000000004250c7	movss	%xmm0, 0x198(%r12)
00000000004250d1	movq	$0x0, 0x19c(%r12)
00000000004250dd	movss	%xmm1, 0x1a4(%r12)
00000000004250e7	movq	(%r12), %rax
00000000004250eb	movq	%r12, %rdi
00000000004250ee	xorl	%esi, %esi
00000000004250f0	movq	%r15, %rdx
00000000004250f3	callq	*0x78(%rax)
00000000004250f6	cmpq	%r12, %r15
00000000004250f9	je	0x425119
00000000004250fb	testq	%r15, %r15
00000000004250fe	je	0x425109
0000000000425100	movq	(%r15), %rax
0000000000425103	movq	%r15, %rdi
0000000000425106	callq	*0x18(%rax)
0000000000425109	movq	%r12, (%rbx)
000000000042510c	movq	(%r12), %rax
0000000000425110	movq	%r12, %rdi
0000000000425113	callq	*0x10(%rax)
0000000000425116	movq	%r12, %r15
0000000000425119	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000042511e	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
0000000000425123	movq	%rax, %r13
0000000000425126	movq	%rax, %rdi
0000000000425129	callq	__ZN25HgcCopyMaskAlphaToMaskRGBC2Ev ## HgcCopyMaskAlphaToMaskRGB::HgcCopyMaskAlphaToMaskRGB()
000000000042512e	leaq	0x43c773(%rip), %rax
0000000000425135	movq	%rax, (%r13)
0000000000425139	movq	-0x30(%rbp), %rdx
000000000042513d	movq	%r13, %rdi
0000000000425140	xorl	%esi, %esi
0000000000425142	callq	0x6de9f4                        ## symbol stub for: __ZN6HGNode8SetInputEiPS_
0000000000425147	movq	(%r13), %rax
000000000042514b	movq	%r13, %rdi
000000000042514e	movl	$0x1, %esi
0000000000425153	movq	%r15, %rdx
0000000000425156	callq	*0x78(%rax)
0000000000425159	movq	(%r13), %rax
000000000042515d	movq	%r13, %rdi
0000000000425160	movl	$0x1, %esi
0000000000425165	movl	$0x2000, %edx                   ## imm = 0x2000
000000000042516a	callq	*0x88(%rax)
0000000000425170	cmpq	%r13, %r15
0000000000425173	je	0x425190
0000000000425175	testq	%r15, %r15
0000000000425178	je	0x425183
000000000042517a	movq	(%r15), %rax
000000000042517d	movq	%r15, %rdi
0000000000425180	callq	*0x18(%rax)
0000000000425183	movq	%r13, (%rbx)
0000000000425186	movq	(%r13), %rax
000000000042518a	movq	%r13, %rdi
000000000042518d	callq	*0x10(%rax)
0000000000425190	movq	(%r13), %rax
0000000000425194	movq	%r13, %rdi
0000000000425197	callq	*0x18(%rax)
000000000042519a	movq	(%r14), %rax
000000000042519d	movq	%r14, %rdi
00000000004251a0	callq	*0x18(%rax)
00000000004251a3	testq	%r12, %r12
00000000004251a6	je	0x4251b2
00000000004251a8	movq	(%r12), %rax
00000000004251ac	movq	%r12, %rdi
00000000004251af	callq	*0x18(%rax)
00000000004251b2	movq	-0x30(%rbp), %rdi
00000000004251b6	testq	%rdi, %rdi
00000000004251b9	je	0x4251c1
00000000004251bb	movq	(%rdi), %rax
00000000004251be	callq	*0x18(%rax)
00000000004251c1	movq	%rbx, %rax
00000000004251c4	addq	$0x58, %rsp
00000000004251c8	popq	%rbx
00000000004251c9	popq	%r12
00000000004251cb	popq	%r13
00000000004251cd	popq	%r14
00000000004251cf	popq	%r15
00000000004251d1	popq	%rbp
00000000004251d2	retq
00000000004251d3	movq	%rax, %r15
00000000004251d6	movq	%r12, %rdi
00000000004251d9	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
00000000004251de	jmp	0x425234
00000000004251e0	jmp	0x425231
00000000004251e2	movq	%rax, %rdi
00000000004251e5	callq	___clang_call_terminate
00000000004251ea	movq	%rax, %rdi
00000000004251ed	callq	___clang_call_terminate
00000000004251f2	movq	%rax, %rdi
00000000004251f5	callq	___clang_call_terminate
00000000004251fa	movq	%rax, %r15
00000000004251fd	movq	%r13, %rdi
0000000000425200	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
0000000000425205	jmp	0x425246
0000000000425207	movq	%rax, %r15
000000000042520a	jmp	0x425246
000000000042520c	jmp	0x425231
000000000042520e	jmp	0x425231
0000000000425210	movq	%rax, %r15
0000000000425213	movq	%r14, %rdi
0000000000425216	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
000000000042521b	jmp	0x42527b
000000000042521d	jmp	0x425278
000000000042521f	movq	%rax, %r15
0000000000425222	jmp	0x425246
0000000000425224	movq	%rax, %rdi
0000000000425227	callq	___clang_call_terminate
000000000042522c	movq	%rax, %r15
000000000042522f	jmp	0x425289
0000000000425231	movq	%rax, %r15
0000000000425234	xorl	%r12d, %r12d
0000000000425237	jmp	0x425246
0000000000425239	movq	%rax, %r15
000000000042523c	movq	(%r13), %rax
0000000000425240	movq	%r13, %rdi
0000000000425243	callq	*0x18(%rax)
0000000000425246	movq	(%r14), %rax
0000000000425249	movq	%r14, %rdi
000000000042524c	callq	*0x18(%rax)
000000000042524f	testq	%r12, %r12
0000000000425252	je	0x42527b
0000000000425254	movq	(%r12), %rax
0000000000425258	movq	%r12, %rdi
000000000042525b	callq	*0x18(%rax)
000000000042525e	jmp	0x42527b
0000000000425260	movq	%rax, %rdi
0000000000425263	callq	___clang_call_terminate
0000000000425268	movq	%rax, %rdi
000000000042526b	callq	___clang_call_terminate
0000000000425270	movq	%rax, %rdi
0000000000425273	callq	___clang_call_terminate
0000000000425278	movq	%rax, %r15
000000000042527b	movq	(%rbx), %rdi
000000000042527e	testq	%rdi, %rdi
0000000000425281	je	0x425289
0000000000425283	movq	(%rdi), %rax
0000000000425286	callq	*0x18(%rax)
0000000000425289	movq	-0x30(%rbp), %rdi
000000000042528d	testq	%rdi, %rdi
0000000000425290	je	0x425298
0000000000425292	movq	(%rdi), %rax
0000000000425295	callq	*0x18(%rax)
0000000000425298	movq	%r15, %rdi
000000000042529b	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004252a0	movq	%rax, %rdi
00000000004252a3	callq	___clang_call_terminate
00000000004252a8	movq	%rax, %rdi
00000000004252ab	callq	___clang_call_terminate
