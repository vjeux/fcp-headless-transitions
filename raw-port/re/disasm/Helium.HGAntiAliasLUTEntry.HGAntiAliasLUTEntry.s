__ZN19HGAntiAliasLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer:
0000000000211d80	pushq	%rbp
0000000000211d81	movq	%rsp, %rbp
0000000000211d84	pushq	%r15
0000000000211d86	pushq	%r14
0000000000211d88	pushq	%r13
0000000000211d8a	pushq	%r12
0000000000211d8c	pushq	%rbx
0000000000211d8d	subq	$0x18, %rsp
0000000000211d91	movq	%rsi, %r15
0000000000211d94	movq	%rdi, %rbx
0000000000211d97	callq	__ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer ## HGLUTCache::LUTEntry::LUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
0000000000211d9c	leaq	0x81d8c5(%rip), %rax
0000000000211da3	movq	%rax, (%rbx)
0000000000211da6	xorps	%xmm0, %xmm0
0000000000211da9	movups	%xmm0, 0x18(%rbx)
0000000000211dad	testq	%r15, %r15
0000000000211db0	je	0x211f0f
0000000000211db6	movq	0x7f0523(%rip), %rsi            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000211dbd	leaq	__ZTI18HGAntiAliasLUTInfo(%rip), %rdx ## typeinfo for HGAntiAliasLUTInfo
0000000000211dc4	xorl	%r14d, %r14d
0000000000211dc7	movq	%r15, %rdi
0000000000211dca	xorl	%ecx, %ecx
0000000000211dcc	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000211dd1	testq	%rax, %rax
0000000000211dd4	je	0x211f0f
0000000000211dda	leaq	0x18(%rbx), %rcx
0000000000211dde	movq	%rcx, -0x30(%rbp)
0000000000211de2	movl	0x8(%rax), %eax
0000000000211de5	cmpl	$0x1, %eax
0000000000211de8	je	0x211e22
0000000000211dea	testl	%eax, %eax
0000000000211dec	jne	0x211e56
0000000000211dee	movss	0x64e2ae(%rip), %xmm2
0000000000211df6	movss	0x64e2aa(%rip), %xmm3
0000000000211dfe	xorps	%xmm0, %xmm0
0000000000211e01	xorps	%xmm1, %xmm1
0000000000211e04	callq	_HGRectMake4f
0000000000211e09	movq	%rax, %r15
0000000000211e0c	movq	%rdx, %r12
0000000000211e0f	leaq	__ZL12areaTexBytes(%rip), %rax  ## areaTexBytes
0000000000211e16	movq	%rax, -0x38(%rbp)
0000000000211e1a	movl	$0xa, %r14d
0000000000211e20	jmp	0x211e6c
0000000000211e22	movss	0x64e276(%rip), %xmm2
0000000000211e2a	movss	0x64e266(%rip), %xmm3
0000000000211e32	xorps	%xmm0, %xmm0
0000000000211e35	xorps	%xmm1, %xmm1
0000000000211e38	callq	_HGRectMake4f
0000000000211e3d	movq	%rax, %r15
0000000000211e40	movq	%rdx, %r12
0000000000211e43	leaq	__ZL14searchTexBytes(%rip), %rax ## searchTexBytes
0000000000211e4a	movq	%rax, -0x38(%rbp)
0000000000211e4e	movl	$0x1, %r14d
0000000000211e54	jmp	0x211e6c
0000000000211e56	leaq	_HGRectNull(%rip), %rax
0000000000211e5d	movq	(%rax), %r15
0000000000211e60	movq	0x8(%rax), %r12
0000000000211e64	movq	$0x0, -0x38(%rbp)
0000000000211e6c	movl	$0x80, %edi
0000000000211e71	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000211e76	movq	%rax, %r13
0000000000211e79	movq	%rax, %rdi
0000000000211e7c	movq	%r15, %rsi
0000000000211e7f	movq	%r12, %rdx
0000000000211e82	movl	%r14d, %ecx
0000000000211e85	callq	__ZN8HGBitmapC1E6HGRect8HGFormat ## HGBitmap::HGBitmap(HGRect, HGFormat)
0000000000211e8a	movq	-0x30(%rbp), %rax
0000000000211e8e	movq	(%rax), %rdi
0000000000211e91	cmpq	%r13, %rdi
0000000000211e94	je	0x211eaa
0000000000211e96	testq	%rdi, %rdi
0000000000211e99	je	0x211ea1
0000000000211e9b	movq	(%rdi), %rax
0000000000211e9e	callq	*0x18(%rax)
0000000000211ea1	movq	-0x30(%rbp), %rax
0000000000211ea5	movq	%r13, (%rax)
0000000000211ea8	jmp	0x211eb9
0000000000211eaa	testq	%r13, %r13
0000000000211ead	je	0x211eb9
0000000000211eaf	movq	(%r13), %rax
0000000000211eb3	movq	%r13, %rdi
0000000000211eb6	callq	*0x18(%rax)
0000000000211eb9	movl	$0x80, %edi
0000000000211ebe	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000211ec3	movq	%rax, %r13
0000000000211ec6	movq	%rax, %rdi
0000000000211ec9	movq	%r15, %rsi
0000000000211ecc	movq	%r12, %rdx
0000000000211ecf	movl	%r14d, %ecx
0000000000211ed2	movq	-0x38(%rbp), %r8
0000000000211ed6	callq	__ZN8HGBitmapC1E6HGRect8HGFormatPv ## HGBitmap::HGBitmap(HGRect, HGFormat, void*)
0000000000211edb	leaq	-0x40(%rbp), %rdi
0000000000211edf	callq	__ZN13HGRenderUtils12BufferCopierC1Ev ## HGRenderUtils::BufferCopier::BufferCopier()
0000000000211ee4	movq	-0x30(%rbp), %rax
0000000000211ee8	movq	(%rax), %rsi
0000000000211eeb	leaq	-0x40(%rbp), %rdi
0000000000211eef	movq	%r13, %rdx
0000000000211ef2	callq	__ZN13HGRenderUtils12BufferCopier7executeEP8HGBitmapS2_ ## HGRenderUtils::BufferCopier::execute(HGBitmap*, HGBitmap*)
0000000000211ef7	leaq	-0x40(%rbp), %rdi
0000000000211efb	callq	__ZN13HGRenderUtils12BufferCopierD1Ev ## HGRenderUtils::BufferCopier::~BufferCopier()
0000000000211f00	testq	%r13, %r13
0000000000211f03	je	0x211f0f
0000000000211f05	movq	(%r13), %rax
0000000000211f09	movq	%r13, %rdi
0000000000211f0c	callq	*0x18(%rax)
0000000000211f0f	addq	$0x18, %rsp
0000000000211f13	popq	%rbx
0000000000211f14	popq	%r12
0000000000211f16	popq	%r13
0000000000211f18	popq	%r14
0000000000211f1a	popq	%r15
0000000000211f1c	popq	%rbp
0000000000211f1d	retq
0000000000211f1e	movq	%rax, %rdi
0000000000211f21	callq	___clang_call_terminate
0000000000211f26	jmp	0x211f89
0000000000211f28	jmp	0x211f89
0000000000211f2a	movq	%rax, %r14
0000000000211f2d	testq	%r13, %r13
0000000000211f30	je	0x211f8c
0000000000211f32	movq	(%r13), %rax
0000000000211f36	movq	%r13, %rdi
0000000000211f39	callq	*0x18(%rax)
0000000000211f3c	jmp	0x211f8c
0000000000211f3e	movq	%rax, %rdi
0000000000211f41	callq	___clang_call_terminate
0000000000211f46	movq	%rax, %rdi
0000000000211f49	callq	___clang_call_terminate
0000000000211f4e	movq	%rax, %r14
0000000000211f51	leaq	-0x40(%rbp), %rdi
0000000000211f55	callq	__ZN13HGRenderUtils12BufferCopierD1Ev ## HGRenderUtils::BufferCopier::~BufferCopier()
0000000000211f5a	jmp	0x211f5f
0000000000211f5c	movq	%rax, %r14
0000000000211f5f	testq	%r13, %r13
0000000000211f62	je	0x211f8c
0000000000211f64	movq	(%r13), %rax
0000000000211f68	movq	%r13, %rdi
0000000000211f6b	callq	*0x18(%rax)
0000000000211f6e	jmp	0x211f8c
0000000000211f70	movq	%rax, %rdi
0000000000211f73	callq	___clang_call_terminate
0000000000211f78	jmp	0x211f7c
0000000000211f7a	jmp	0x211f89
0000000000211f7c	movq	%rax, %r14
0000000000211f7f	movq	%r13, %rdi
0000000000211f82	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000211f87	jmp	0x211f8c
0000000000211f89	movq	%rax, %r14
0000000000211f8c	movq	0x20(%rbx), %rdi
0000000000211f90	testq	%rdi, %rdi
0000000000211f93	je	0x211f9b
0000000000211f95	movq	(%rdi), %rax
0000000000211f98	callq	*0x18(%rax)
0000000000211f9b	movq	-0x30(%rbp), %rax
0000000000211f9f	movq	(%rax), %rdi
0000000000211fa2	testq	%rdi, %rdi
0000000000211fa5	je	0x211fad
0000000000211fa7	movq	(%rdi), %rax
0000000000211faa	callq	*0x18(%rax)
0000000000211fad	movq	%rbx, %rdi
0000000000211fb0	callq	__ZN10HGLUTCache8LUTEntryD2Ev   ## HGLUTCache::LUTEntry::~LUTEntry()
0000000000211fb5	movq	%r14, %rdi
0000000000211fb8	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000211fbd	movq	%rax, %rdi
0000000000211fc0	callq	___clang_call_terminate
0000000000211fc5	movq	%rax, %rdi
0000000000211fc8	callq	___clang_call_terminate
0000000000211fcd	nopl	(%rax)
