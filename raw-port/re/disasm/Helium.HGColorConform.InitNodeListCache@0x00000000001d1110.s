__ZN14HGColorConform17InitNodeListCacheEv:
00000000001d1110	pushq	%rbp
00000000001d1111	movq	%rsp, %rbp
00000000001d1114	pushq	%r14
00000000001d1116	pushq	%rbx
00000000001d1117	subq	$0x10, %rsp
00000000001d111b	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %rbx ## HGColorConform::s_NodeListCacheLock
00000000001d1122	movq	%rbx, -0x20(%rbp)
00000000001d1126	movb	$0x0, -0x18(%rbp)
00000000001d112a	movq	%rbx, %rdi
00000000001d112d	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001d1132	movb	$0x1, %r14b
00000000001d1135	cmpq	$0x0, __ZN14HGColorConform15s_NodeListCacheE(%rip) ## HGColorConform::s_NodeListCache
00000000001d113d	jne	0x1d1162
00000000001d113f	movq	0x830fa2(%rip), %rdx            ## literal pool symbol address: _kCFTypeDictionaryKeyCallBacks
00000000001d1146	movl	$0x32, %esi
00000000001d114b	xorl	%edi, %edi
00000000001d114d	xorl	%ecx, %ecx
00000000001d114f	callq	0x3c4ad8                        ## symbol stub for: _CFDictionaryCreateMutable
00000000001d1154	movq	%rax, __ZN14HGColorConform15s_NodeListCacheE(%rip) ## HGColorConform::s_NodeListCache
00000000001d115b	testq	%rax, %rax
00000000001d115e	setne	%r14b
00000000001d1162	movq	%rbx, %rdi
00000000001d1165	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001d116a	movl	%r14d, %eax
00000000001d116d	addq	$0x10, %rsp
00000000001d1171	popq	%rbx
00000000001d1172	popq	%r14
00000000001d1174	popq	%rbp
00000000001d1175	retq
00000000001d1176	movq	%rax, %rbx
00000000001d1179	leaq	-0x20(%rbp), %rdi
00000000001d117d	callq	__ZN14HGSynchronizerD1Ev        ## HGSynchronizer::~HGSynchronizer()
00000000001d1182	movq	%rbx, %rdi
00000000001d1185	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d118a	movq	%rax, %rdi
00000000001d118d	callq	___clang_call_terminate
00000000001d1192	nopw	%cs:(%rax,%rax)
