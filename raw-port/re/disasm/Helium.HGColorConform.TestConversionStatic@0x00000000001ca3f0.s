__ZN14HGColorConform20TestConversionStaticEP12CGColorSpaceS1_:
00000000001ca3f0	pushq	%rbp
00000000001ca3f1	movq	%rsp, %rbp
00000000001ca3f4	pushq	%r15
00000000001ca3f6	pushq	%r14
00000000001ca3f8	pushq	%rbx
00000000001ca3f9	subq	$0x18, %rsp
00000000001ca3fd	movq	%rsi, %r14
00000000001ca400	movq	%rdi, %r15
00000000001ca403	leaq	__ZL35hgColorConformNodeListCacheLockInit(%rip), %rdi ## hgColorConformNodeListCacheLockInit
00000000001ca40a	leaq	__Z43hgColorConformNodeListCacheLockInitFunctionv(%rip), %rsi ## hgColorConformNodeListCacheLockInitFunction()
00000000001ca411	callq	0x3c5576                        ## symbol stub for: _pthread_once
00000000001ca416	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %rbx ## HGColorConform::s_NodeListCacheLock
00000000001ca41d	movq	%rbx, -0x28(%rbp)
00000000001ca421	movb	$0x0, -0x20(%rbp)
00000000001ca425	movq	%rbx, %rdi
00000000001ca428	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001ca42d	leaq	-0x30(%rbp), %rdx
00000000001ca431	movq	%r15, %rdi
00000000001ca434	movq	%r14, %rsi
00000000001ca437	callq	__ZN14HGColorConform19SetConversionStaticEP12CGColorSpaceS1_PP31HGColorConformNodeListCacheItem ## HGColorConform::SetConversionStatic(CGColorSpace*, CGColorSpace*, HGColorConformNodeListCacheItem**)
00000000001ca43c	movl	%eax, %r14d
00000000001ca43f	movq	%rbx, %rdi
00000000001ca442	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001ca447	movl	%r14d, %eax
00000000001ca44a	addq	$0x18, %rsp
00000000001ca44e	popq	%rbx
00000000001ca44f	popq	%r14
00000000001ca451	popq	%r15
00000000001ca453	popq	%rbp
00000000001ca454	retq
00000000001ca455	movq	%rax, %rdi
00000000001ca458	callq	___clang_call_terminate
00000000001ca45d	movq	%rax, %rbx
00000000001ca460	leaq	-0x28(%rbp), %rdi
00000000001ca464	callq	__ZN14HGSynchronizerD1Ev        ## HGSynchronizer::~HGSynchronizer()
00000000001ca469	movq	%rbx, %rdi
00000000001ca46c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001ca471	nopw	%cs:(%rax,%rax)
