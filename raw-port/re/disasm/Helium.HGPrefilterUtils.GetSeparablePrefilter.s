__ZN16HGPrefilterUtils21GetSeparablePrefilterER16HGLinearFilter2DNS_10KernelTypeEffbf:
0000000000109e60	pushq	%rbp
0000000000109e61	movq	%rsp, %rbp
0000000000109e64	pushq	%r15
0000000000109e66	pushq	%r14
0000000000109e68	pushq	%r13
0000000000109e6a	pushq	%r12
0000000000109e6c	pushq	%rbx
0000000000109e6d	subq	$0x48, %rsp
0000000000109e71	movss	%xmm2, -0x34(%rbp)
0000000000109e76	movl	%edx, %r14d
0000000000109e79	movss	%xmm1, -0x30(%rbp)
0000000000109e7e	movl	%esi, %r13d
0000000000109e81	movq	%rdi, %rbx
0000000000109e84	callq	0x3c53f6                        ## symbol stub for: _log10f
0000000000109e89	cmpl	$0x4, %r13d
0000000000109e8d	jae	0x10a08f
0000000000109e93	movaps	%xmm0, %xmm2
0000000000109e96	divss	0x2c846e(%rip), %xmm2
0000000000109e9e	xorps	%xmm0, %xmm0
0000000000109ea1	ucomiss	%xmm0, %xmm2
0000000000109ea4	movss	-0x30(%rbp), %xmm1
0000000000109ea9	jbe	0x10a0d2
0000000000109eaf	ucomiss	0x2bde0a(%rip), %xmm1
0000000000109eb6	jbe	0x10a0d2
0000000000109ebc	movl	%r14d, -0x38(%rbp)
0000000000109ec0	movl	%r13d, %eax
0000000000109ec3	leaq	0x2c8456(%rip), %rcx
0000000000109eca	leaq	0x2c845f(%rip), %rdx
0000000000109ed1	movss	(%rdx,%rax,4), %xmm0
0000000000109ed6	movss	%xmm0, -0x3c(%rbp)
0000000000109edb	movss	(%rcx,%rax,4), %xmm0
0000000000109ee0	mulss	%xmm1, %xmm0
0000000000109ee4	movss	%xmm2, -0x2c(%rbp)
0000000000109ee9	mulss	%xmm2, %xmm0
0000000000109eed	roundss	$0xa, %xmm0, %xmm0
0000000000109ef3	cvttss2si	%xmm0, %r15d
0000000000109ef8	xorps	%xmm0, %xmm0
0000000000109efb	cmpneqss	-0x34(%rbp), %xmm0
0000000000109f01	movd	%xmm0, %r12d
0000000000109f06	andl	$0x1, %r12d
0000000000109f0a	movq	%rbx, %rdi
0000000000109f0d	xorl	%esi, %esi
0000000000109f0f	xorl	%edx, %edx
0000000000109f11	callq	__ZN16HGLinearFilter2D5resetEii ## HGLinearFilter2D::reset(int, int)
0000000000109f16	leaq	0x7ddeb3(%rip), %rdi            ## literal pool for: "prefilter"
0000000000109f1d	callq	__ZN8HGLogger8getLevelEPKc      ## HGLogger::getLevel(char const*)
0000000000109f22	testl	%eax, %eax
0000000000109f24	je	0x109f9b
0000000000109f26	movss	-0x30(%rbp), %xmm0
0000000000109f2b	cvtss2sd	%xmm0, %xmm0
0000000000109f2f	leal	(%r12,%r15,2), %r14d
0000000000109f33	incl	%r14d
0000000000109f36	leaq	__ZN8HGLogger8_enabledE(%rip), %rdx ## HGLogger::_enabled
0000000000109f3d	movzbl	(%rdx), %eax
0000000000109f40	cmpb	$0x1, %al
0000000000109f42	jne	0x109f77
0000000000109f44	leaq	0x7dde85(%rip), %rdi            ## literal pool for: "prefilter"
0000000000109f4b	leaq	0x7ddea7(%rip), %rdx            ## literal pool for: "downsample_factor_x=%f num_taps=%d\n"
0000000000109f52	movl	$0x1, %esi
0000000000109f57	movsd	%xmm0, -0x48(%rbp)
0000000000109f5c	movsd	-0x48(%rbp), %xmm0
0000000000109f61	movl	%r14d, %ecx
0000000000109f64	movb	$0x1, %al
0000000000109f66	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
0000000000109f6b	leaq	__ZN8HGLogger8_enabledE(%rip), %rdx ## HGLogger::_enabled
0000000000109f72	movsd	-0x48(%rbp), %xmm0
0000000000109f77	movzbl	(%rdx), %eax
0000000000109f7a	cmpb	$0x1, %al
0000000000109f7c	jne	0x109f9b
0000000000109f7e	leaq	0x7dde4b(%rip), %rdi            ## literal pool for: "prefilter"
0000000000109f85	leaq	0x7dde91(%rip), %rdx            ## literal pool for: "downsample_factor_x=%f coeffx[%d]={\n"
0000000000109f8c	movl	$0x1, %esi
0000000000109f91	movl	%r14d, %ecx
0000000000109f94	movb	$0x1, %al
0000000000109f96	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
0000000000109f9b	testl	%r15d, %r15d
0000000000109f9e	movss	-0x30(%rbp), %xmm1
0000000000109fa3	js	0x10a19d
0000000000109fa9	mulss	-0x2c(%rbp), %xmm1
0000000000109fae	cmpl	$0x2, %r13d
0000000000109fb2	movss	%xmm1, -0x30(%rbp)
0000000000109fb7	je	0x10a131
0000000000109fbd	subl	%r15d, %r12d
0000000000109fc0	cmpl	$0x3, %r13d
0000000000109fc4	jne	0x10a030
0000000000109fc6	nopw	%cs:(%rax,%rax)
0000000000109fd0	xorps	%xmm0, %xmm0
0000000000109fd3	cvtsi2ss	%r15d, %xmm0
0000000000109fd8	subss	-0x34(%rbp), %xmm0
0000000000109fdd	divss	%xmm1, %xmm0
0000000000109fe1	xorps	%xmm1, %xmm1
0000000000109fe4	xorps	%xmm2, %xmm2
0000000000109fe7	callq	__ZN14HGLinearFilter4rectEfff   ## HGLinearFilter::rect(float, float, float)
0000000000109fec	movss	%xmm0, -0x2c(%rbp)
0000000000109ff1	movq	%rbx, %rdi
0000000000109ff4	movl	%r15d, %esi
0000000000109ff7	xorl	%edx, %edx
0000000000109ff9	movl	$0x4, %ecx
0000000000109ffe	callq	__ZN16HGLinearFilter2D3setEiifj ## HGLinearFilter2D::set(int, int, float, unsigned int)
000000000010a003	movq	%rbx, %rdi
000000000010a006	movl	%r12d, %esi
000000000010a009	xorl	%edx, %edx
000000000010a00b	movss	-0x2c(%rbp), %xmm0
000000000010a010	movl	$0x4, %ecx
000000000010a015	callq	__ZN16HGLinearFilter2D3setEiifj ## HGLinearFilter2D::set(int, int, float, unsigned int)
000000000010a01a	movss	-0x30(%rbp), %xmm1
000000000010a01f	incl	%r12d
000000000010a022	addl	$-0x1, %r15d
000000000010a026	jb	0x109fd0
000000000010a028	jmp	0x10a19d
000000000010a02d	nopl	(%rax)
000000000010a030	xorps	%xmm0, %xmm0
000000000010a033	cvtsi2ss	%r15d, %xmm0
000000000010a038	subss	-0x34(%rbp), %xmm0
000000000010a03d	divss	%xmm1, %xmm0
000000000010a041	xorps	%xmm2, %xmm2
000000000010a044	movss	-0x3c(%rbp), %xmm1
000000000010a049	callq	__ZN14HGLinearFilter7lanczosEfff ## HGLinearFilter::lanczos(float, float, float)
000000000010a04e	movss	%xmm0, -0x2c(%rbp)
000000000010a053	movq	%rbx, %rdi
000000000010a056	movl	%r15d, %esi
000000000010a059	xorl	%edx, %edx
000000000010a05b	movl	$0x4, %ecx
000000000010a060	callq	__ZN16HGLinearFilter2D3setEiifj ## HGLinearFilter2D::set(int, int, float, unsigned int)
000000000010a065	movq	%rbx, %rdi
000000000010a068	movl	%r12d, %esi
000000000010a06b	xorl	%edx, %edx
000000000010a06d	movss	-0x2c(%rbp), %xmm0
000000000010a072	movl	$0x4, %ecx
000000000010a077	callq	__ZN16HGLinearFilter2D3setEiifj ## HGLinearFilter2D::set(int, int, float, unsigned int)
000000000010a07c	movss	-0x30(%rbp), %xmm1
000000000010a081	incl	%r12d
000000000010a084	addl	$-0x1, %r15d
000000000010a088	jb	0x10a030
000000000010a08a	jmp	0x10a19d
000000000010a08f	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
000000000010a096	movzbl	(%rax), %eax
000000000010a099	cmpb	$0x1, %al
000000000010a09b	jne	0x10a0b7
000000000010a09d	leaq	0x7ddd2c(%rip), %rdi            ## literal pool for: "prefilter"
000000000010a0a4	leaq	0x7ddd2f(%rip), %rdx            ## literal pool for: "WARNING: Invalid filter kernel"
000000000010a0ab	movl	$0x1, %esi
000000000010a0b0	xorl	%eax, %eax
000000000010a0b2	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
000000000010a0b7	leaq	-0x68(%rbp), %r14
000000000010a0bb	movq	%r14, %rdi
000000000010a0be	xorl	%esi, %esi
000000000010a0c0	callq	__ZN16HGLinearFilter2DC1E14HGFilterPreset ## HGLinearFilter2D::HGLinearFilter2D(HGFilterPreset)
000000000010a0c5	movq	%rbx, %rdi
000000000010a0c8	movq	%r14, %rsi
000000000010a0cb	callq	__ZN16HGLinearFilter2DaSERKS_   ## HGLinearFilter2D::operator=(HGLinearFilter2D const&)
000000000010a0d0	jmp	0x10a113
000000000010a0d2	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
000000000010a0d9	movzbl	(%rax), %eax
000000000010a0dc	cmpb	$0x1, %al
000000000010a0de	jne	0x10a0fa
000000000010a0e0	leaq	0x7ddce9(%rip), %rdi            ## literal pool for: "prefilter"
000000000010a0e7	leaq	0x7ddd5f(%rip), %rdx            ## literal pool for: "WARNING: Invalid filter coefficients"
000000000010a0ee	movl	$0x1, %esi
000000000010a0f3	xorl	%eax, %eax
000000000010a0f5	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
000000000010a0fa	leaq	-0x68(%rbp), %r14
000000000010a0fe	movq	%r14, %rdi
000000000010a101	xorl	%esi, %esi
000000000010a103	callq	__ZN16HGLinearFilter2DC1E14HGFilterPreset ## HGLinearFilter2D::HGLinearFilter2D(HGFilterPreset)
000000000010a108	movq	%rbx, %rdi
000000000010a10b	movq	%r14, %rsi
000000000010a10e	callq	__ZN16HGLinearFilter2DaSERKS_   ## HGLinearFilter2D::operator=(HGLinearFilter2D const&)
000000000010a113	leaq	-0x68(%rbp), %rdi
000000000010a117	callq	__ZN16HGLinearFilter2DD1Ev      ## HGLinearFilter2D::~HGLinearFilter2D()
000000000010a11c	xorl	%r15d, %r15d
000000000010a11f	movl	%r15d, %eax
000000000010a122	addq	$0x48, %rsp
000000000010a126	popq	%rbx
000000000010a127	popq	%r12
000000000010a129	popq	%r13
000000000010a12b	popq	%r14
000000000010a12d	popq	%r15
000000000010a12f	popq	%rbp
000000000010a130	retq
000000000010a131	subl	%r15d, %r12d
000000000010a134	nopw	%cs:(%rax,%rax)
000000000010a140	xorps	%xmm0, %xmm0
000000000010a143	cvtsi2ss	%r15d, %xmm0
000000000010a148	subss	-0x34(%rbp), %xmm0
000000000010a14d	divss	%xmm1, %xmm0
000000000010a151	xorps	%xmm1, %xmm1
000000000010a154	movss	0x2c81b4(%rip), %xmm2
000000000010a15c	callq	__ZN14HGLinearFilter7bicubicEfff ## HGLinearFilter::bicubic(float, float, float)
000000000010a161	movss	%xmm0, -0x2c(%rbp)
000000000010a166	movq	%rbx, %rdi
000000000010a169	movl	%r15d, %esi
000000000010a16c	xorl	%edx, %edx
000000000010a16e	movl	$0x4, %ecx
000000000010a173	callq	__ZN16HGLinearFilter2D3setEiifj ## HGLinearFilter2D::set(int, int, float, unsigned int)
000000000010a178	movq	%rbx, %rdi
000000000010a17b	movl	%r12d, %esi
000000000010a17e	xorl	%edx, %edx
000000000010a180	movss	-0x2c(%rbp), %xmm0
000000000010a185	movl	$0x4, %ecx
000000000010a18a	callq	__ZN16HGLinearFilter2D3setEiifj ## HGLinearFilter2D::set(int, int, float, unsigned int)
000000000010a18f	movss	-0x30(%rbp), %xmm1
000000000010a194	incl	%r12d
000000000010a197	addl	$-0x1, %r15d
000000000010a19b	jb	0x10a140
000000000010a19d	movaps	0x2bda9c(%rip), %xmm0
000000000010a1a4	movq	%rbx, %rdi
000000000010a1a7	movl	$0x4, %esi
000000000010a1ac	callq	__ZN16HGLinearFilter2D9normalizeEDv4_fj ## HGLinearFilter2D::normalize(float vector[4], unsigned int)
000000000010a1b1	leaq	0x7ddc18(%rip), %rdi            ## literal pool for: "prefilter"
000000000010a1b8	callq	__ZN8HGLogger8getLevelEPKc      ## HGLogger::getLevel(char const*)
000000000010a1bd	testl	%eax, %eax
000000000010a1bf	je	0x10a1fc
000000000010a1c1	movl	0x8(%rbx), %r15d
000000000010a1c5	movl	0x10(%rbx), %r14d
000000000010a1c9	leal	(%r15,%r14), %eax
000000000010a1cd	decl	%eax
000000000010a1cf	cmpl	%eax, %r15d
000000000010a1d2	jle	0x10a216
000000000010a1d4	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
000000000010a1db	movzbl	(%rax), %eax
000000000010a1de	testb	%al, %al
000000000010a1e0	je	0x10a1fc
000000000010a1e2	leaq	0x7ddbe7(%rip), %rdi            ## literal pool for: "prefilter"
000000000010a1e9	leaq	0x7b0a76(%rip), %rdx            ## literal pool for: "}\n"
000000000010a1f0	movl	$0x1, %esi
000000000010a1f5	xorl	%eax, %eax
000000000010a1f7	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
000000000010a1fc	movb	$0x1, %r15b
000000000010a1ff	cmpb	$0x0, -0x38(%rbp)
000000000010a203	je	0x10a11f
000000000010a209	movq	%rbx, %rdi
000000000010a20c	callq	__ZN16HGLinearFilter2D9transposeEv ## HGLinearFilter2D::transpose()
000000000010a211	jmp	0x10a11f
000000000010a216	leaq	__ZN8HGLogger8_enabledE(%rip), %r12 ## HGLogger::_enabled
000000000010a21d	leaq	0x7ddc1e(%rip), %r13            ## literal pool for: "[%d] = %f\n"
000000000010a224	jmp	0x10a238
000000000010a226	nopw	%cs:(%rax,%rax)
000000000010a230	incl	%r15d
000000000010a233	decl	%r14d
000000000010a236	je	0x10a1d4
000000000010a238	movl	0x10(%rbx), %eax
000000000010a23b	imull	0xc(%rbx), %eax
000000000010a23f	addl	0x8(%rbx), %eax
000000000010a242	movq	(%rbx), %rcx
000000000010a245	movl	%r15d, %edx
000000000010a248	subl	%eax, %edx
000000000010a24a	movslq	%edx, %rax
000000000010a24d	shlq	$0x4, %rax
000000000010a251	movss	(%rcx,%rax), %xmm0
000000000010a256	movzbl	(%r12), %eax
000000000010a25b	cmpb	$0x1, %al
000000000010a25d	jne	0x10a230
000000000010a25f	cvtss2sd	%xmm0, %xmm0
000000000010a263	leaq	0x7ddb66(%rip), %rdi            ## literal pool for: "prefilter"
000000000010a26a	movl	$0x1, %esi
000000000010a26f	movq	%r13, %rdx
000000000010a272	movl	%r15d, %ecx
000000000010a275	movb	$0x1, %al
000000000010a277	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
000000000010a27c	jmp	0x10a230
000000000010a27e	jmp	0x10a280
000000000010a280	movq	%rax, %rbx
000000000010a283	leaq	-0x68(%rbp), %rdi
000000000010a287	callq	__ZN16HGLinearFilter2DD1Ev      ## HGLinearFilter2D::~HGLinearFilter2D()
000000000010a28c	movq	%rbx, %rdi
000000000010a28f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000010a294	addb	%al, (%rax)
000000000010a296	addb	%al, (%rax)
000000000010a298	addb	%al, (%rax)
000000000010a29a	addb	%al, (%rax)
000000000010a29c	addb	%al, (%rax)
000000000010a29e	addb	%al, (%rax)
