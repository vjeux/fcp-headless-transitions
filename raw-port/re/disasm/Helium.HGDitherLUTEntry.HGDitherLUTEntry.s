__ZN16HGDitherLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer:
000000000006ff70	pushq	%rbp
000000000006ff71	movq	%rsp, %rbp
000000000006ff74	pushq	%r15
000000000006ff76	pushq	%r14
000000000006ff78	pushq	%r13
000000000006ff7a	pushq	%r12
000000000006ff7c	pushq	%rbx
000000000006ff7d	subq	$0x18, %rsp
000000000006ff81	movq	%rsi, %r14
000000000006ff84	movq	%rdi, %rbx
000000000006ff87	callq	__ZN10HGLUTCache8LUTEntryC2EPNS_7LUTInfoEP10HGRenderer ## HGLUTCache::LUTEntry::LUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
000000000006ff8c	leaq	0x998c85(%rip), %rax
000000000006ff93	movq	%rax, (%rbx)
000000000006ff96	xorps	%xmm0, %xmm0
000000000006ff99	movups	%xmm0, 0x18(%rbx)
000000000006ff9d	testq	%r14, %r14
000000000006ffa0	je	0x700ea
000000000006ffa6	movq	0x992333(%rip), %rsi            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
000000000006ffad	leaq	__ZTI15HGDitherLUTInfo(%rip), %rdx ## typeinfo for HGDitherLUTInfo
000000000006ffb4	movq	%r14, %rdi
000000000006ffb7	xorl	%ecx, %ecx
000000000006ffb9	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
000000000006ffbe	testq	%rax, %rax
000000000006ffc1	je	0x700ea
000000000006ffc7	leaq	0x18(%rbx), %rax
000000000006ffcb	movq	%rax, -0x38(%rbp)
000000000006ffcf	callq	__ZN13HGDitherNoise10getNumColsEv ## HGDitherNoise::getNumCols()
000000000006ffd4	movl	%eax, %r14d
000000000006ffd7	callq	__ZN13HGDitherNoise10getNumColsEv ## HGDitherNoise::getNumCols()
000000000006ffdc	cvtsi2ss	%r14d, %xmm2
000000000006ffe1	cvtsi2ss	%eax, %xmm3
000000000006ffe5	xorps	%xmm0, %xmm0
000000000006ffe8	xorps	%xmm1, %xmm1
000000000006ffeb	callq	_HGRectMake4f
000000000006fff0	movq	%rax, %r12
000000000006fff3	movq	%rdx, %r13
000000000006fff6	callq	__ZN13HGDitherNoise9getFormatEv ## HGDitherNoise::getFormat()
000000000006fffb	movl	%eax, -0x3c(%rbp)
000000000006fffe	movl	$0x80, %edi
0000000000070003	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000070008	movq	%rax, %r14
000000000007000b	movq	%rax, %rdi
000000000007000e	movq	%r12, %rsi
0000000000070011	movq	%r13, %rdx
0000000000070014	movl	$0x1b, %ecx
0000000000070019	callq	__ZN8HGBitmapC1E6HGRect8HGFormat ## HGBitmap::HGBitmap(HGRect, HGFormat)
000000000007001e	movq	-0x38(%rbp), %rax
0000000000070022	movq	(%rax), %rdi
0000000000070025	cmpq	%r14, %rdi
0000000000070028	je	0x7003e
000000000007002a	testq	%rdi, %rdi
000000000007002d	je	0x70035
000000000007002f	movq	(%rdi), %rax
0000000000070032	callq	*0x18(%rax)
0000000000070035	movq	-0x38(%rbp), %rax
0000000000070039	movq	%r14, (%rax)
000000000007003c	jmp	0x7004c
000000000007003e	testq	%r14, %r14
0000000000070041	je	0x7004c
0000000000070043	movq	(%r14), %rax
0000000000070046	movq	%r14, %rdi
0000000000070049	callq	*0x18(%rax)
000000000007004c	movl	$0x3, %edi
0000000000070051	callq	__ZN13HGDitherNoise8getNoiseENS_7PDFModeE ## HGDitherNoise::getNoise(HGDitherNoise::PDFMode)
0000000000070056	movq	%rax, %r15
0000000000070059	movl	$0x80, %edi
000000000007005e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000070063	movq	%rax, %r14
0000000000070066	movq	%rax, %rdi
0000000000070069	movq	%r12, %rsi
000000000007006c	movq	%r13, %rdx
000000000007006f	movl	-0x3c(%rbp), %r12d
0000000000070073	movl	%r12d, %ecx
0000000000070076	movq	%r15, %r8
0000000000070079	callq	__ZN8HGBitmapC1E6HGRect8HGFormatPv ## HGBitmap::HGBitmap(HGRect, HGFormat, void*)
000000000007007e	movq	-0x38(%rbp), %rax
0000000000070082	movq	(%rax), %rax
0000000000070085	cmpl	0x10(%rax), %r12d
0000000000070089	jne	0x700b7
000000000007008b	leaq	-0x30(%rbp), %rdi
000000000007008f	callq	__ZN13HGRenderUtils12BufferCopierC1Ev ## HGRenderUtils::BufferCopier::BufferCopier()
0000000000070094	movq	-0x38(%rbp), %rax
0000000000070098	movq	(%rax), %rsi
000000000007009b	leaq	-0x30(%rbp), %rdi
000000000007009f	movq	%r14, %rdx
00000000000700a2	callq	__ZN13HGRenderUtils12BufferCopier7executeEP8HGBitmapS2_ ## HGRenderUtils::BufferCopier::execute(HGBitmap*, HGBitmap*)
00000000000700a7	leaq	-0x30(%rbp), %rdi
00000000000700ab	callq	__ZN13HGRenderUtils12BufferCopierD1Ev ## HGRenderUtils::BufferCopier::~BufferCopier()
00000000000700b0	testq	%r14, %r14
00000000000700b3	jne	0x700e1
00000000000700b5	jmp	0x700ea
00000000000700b7	leaq	-0x30(%rbp), %rdi
00000000000700bb	callq	__ZN13HGRenderUtils17BufferReformatterC1Ev ## HGRenderUtils::BufferReformatter::BufferReformatter()
00000000000700c0	movq	-0x38(%rbp), %rax
00000000000700c4	movq	(%rax), %rsi
00000000000700c7	leaq	-0x30(%rbp), %rdi
00000000000700cb	movq	%r14, %rdx
00000000000700ce	callq	__ZN13HGRenderUtils17BufferReformatter7executeEP8HGBitmapS2_ ## HGRenderUtils::BufferReformatter::execute(HGBitmap*, HGBitmap*)
00000000000700d3	leaq	-0x30(%rbp), %rdi
00000000000700d7	callq	__ZN13HGRenderUtils17BufferReformatterD1Ev ## HGRenderUtils::BufferReformatter::~BufferReformatter()
00000000000700dc	testq	%r14, %r14
00000000000700df	je	0x700ea
00000000000700e1	movq	(%r14), %rax
00000000000700e4	movq	%r14, %rdi
00000000000700e7	callq	*0x18(%rax)
00000000000700ea	addq	$0x18, %rsp
00000000000700ee	popq	%rbx
00000000000700ef	popq	%r12
00000000000700f1	popq	%r13
00000000000700f3	popq	%r14
00000000000700f5	popq	%r15
00000000000700f7	popq	%rbp
00000000000700f8	retq
00000000000700f9	movq	%rax, %rdi
00000000000700fc	callq	___clang_call_terminate
0000000000070101	movq	%rax, %r15
0000000000070104	testq	%r14, %r14
0000000000070107	je	0x70177
0000000000070109	movq	(%r14), %rax
000000000007010c	movq	%r14, %rdi
000000000007010f	callq	*0x18(%rax)
0000000000070112	jmp	0x70177
0000000000070114	movq	%rax, %rdi
0000000000070117	callq	___clang_call_terminate
000000000007011c	movq	%rax, %r15
000000000007011f	leaq	-0x30(%rbp), %rdi
0000000000070123	callq	__ZN13HGRenderUtils17BufferReformatterD1Ev ## HGRenderUtils::BufferReformatter::~BufferReformatter()
0000000000070128	jmp	0x7013d
000000000007012a	movq	%rax, %r15
000000000007012d	leaq	-0x30(%rbp), %rdi
0000000000070131	callq	__ZN13HGRenderUtils12BufferCopierD1Ev ## HGRenderUtils::BufferCopier::~BufferCopier()
0000000000070136	jmp	0x7013d
0000000000070138	jmp	0x7013a
000000000007013a	movq	%rax, %r15
000000000007013d	testq	%r14, %r14
0000000000070140	je	0x70177
0000000000070142	movq	(%r14), %rax
0000000000070145	movq	%r14, %rdi
0000000000070148	callq	*0x18(%rax)
000000000007014b	jmp	0x70177
000000000007014d	movq	%rax, %rdi
0000000000070150	callq	___clang_call_terminate
0000000000070155	movq	%rax, %rdi
0000000000070158	callq	___clang_call_terminate
000000000007015d	jmp	0x70163
000000000007015f	jmp	0x70174
0000000000070161	jmp	0x70174
0000000000070163	movq	%rax, %r15
0000000000070166	movq	%r14, %rdi
0000000000070169	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000007016e	jmp	0x70177
0000000000070170	jmp	0x70174
0000000000070172	jmp	0x70174
0000000000070174	movq	%rax, %r15
0000000000070177	movq	0x20(%rbx), %rdi
000000000007017b	testq	%rdi, %rdi
000000000007017e	je	0x70186
0000000000070180	movq	(%rdi), %rax
0000000000070183	callq	*0x18(%rax)
0000000000070186	movq	-0x38(%rbp), %rax
000000000007018a	movq	(%rax), %rdi
000000000007018d	testq	%rdi, %rdi
0000000000070190	je	0x70198
0000000000070192	movq	(%rdi), %rax
0000000000070195	callq	*0x18(%rax)
0000000000070198	movq	%rbx, %rdi
000000000007019b	callq	__ZN10HGLUTCache8LUTEntryD2Ev   ## HGLUTCache::LUTEntry::~LUTEntry()
00000000000701a0	movq	%r15, %rdi
00000000000701a3	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000701a8	movq	%rax, %rdi
00000000000701ab	callq	___clang_call_terminate
00000000000701b0	movq	%rax, %rdi
00000000000701b3	callq	___clang_call_terminate
00000000000701b8	nopl	(%rax,%rax)
