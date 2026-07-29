__ZN14HGColorConform18AddNodeListToCacheEPK16ColorSyncProfileS2_PNSt3__16vectorIP26HGColorConformNodeListItemNS3_9allocatorIS6_EEEE:
00000000001d0e20	pushq	%rbp
00000000001d0e21	movq	%rsp, %rbp
00000000001d0e24	pushq	%r15
00000000001d0e26	pushq	%r14
00000000001d0e28	pushq	%r13
00000000001d0e2a	pushq	%r12
00000000001d0e2c	pushq	%rbx
00000000001d0e2d	subq	$0x78, %rsp
00000000001d0e31	movq	%rdx, %r12
00000000001d0e34	movq	%rsi, %r14
00000000001d0e37	movq	%rdi, %r15
00000000001d0e3a	movq	0x831417(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001d0e41	movq	(%rax), %rax
00000000001d0e44	movq	%rax, -0x30(%rbp)
00000000001d0e48	movl	$0x18, %edi
00000000001d0e4d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001d0e52	movq	%rax, %rbx
00000000001d0e55	movq	%rax, %rdi
00000000001d0e58	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001d0e5d	leaq	0x8590a4(%rip), %rax
00000000001d0e64	movq	%rax, (%rbx)
00000000001d0e67	movq	%r12, 0x10(%rbx)
00000000001d0e6b	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %r12 ## HGColorConform::s_NodeListCacheLock
00000000001d0e72	movq	%r12, -0xa0(%rbp)
00000000001d0e79	movb	$0x0, -0x98(%rbp)
00000000001d0e80	movq	%r12, %rdi
00000000001d0e83	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001d0e88	movb	$0x1, %r13b
00000000001d0e8b	cmpq	$0x0, __ZN14HGColorConform15s_NodeListCacheE(%rip) ## HGColorConform::s_NodeListCache
00000000001d0e93	jne	0x1d0eb8
00000000001d0e95	movq	0x83124c(%rip), %rdx            ## literal pool symbol address: _kCFTypeDictionaryKeyCallBacks
00000000001d0e9c	movl	$0x32, %esi
00000000001d0ea1	xorl	%edi, %edi
00000000001d0ea3	xorl	%ecx, %ecx
00000000001d0ea5	callq	0x3c4ad8                        ## symbol stub for: _CFDictionaryCreateMutable
00000000001d0eaa	movq	%rax, __ZN14HGColorConform15s_NodeListCacheE(%rip) ## HGColorConform::s_NodeListCache
00000000001d0eb1	testq	%rax, %rax
00000000001d0eb4	setne	%r13b
00000000001d0eb8	movq	%r12, %rdi
00000000001d0ebb	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001d0ec0	testb	%r13b, %r13b
00000000001d0ec3	je	0x1d0f8d
00000000001d0ec9	movq	%r15, %rdi
00000000001d0ecc	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001d0ed1	movq	%rax, -0x40(%rbp)
00000000001d0ed5	movq	%rdx, -0x38(%rbp)
00000000001d0ed9	movq	%r14, %rdi
00000000001d0edc	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001d0ee1	movq	%rax, -0x50(%rbp)
00000000001d0ee5	movq	%rdx, -0x48(%rbp)
00000000001d0ee9	leaq	-0xa0(%rbp), %r14
00000000001d0ef0	leaq	-0x40(%rbp), %rsi
00000000001d0ef4	movq	%r14, %rdi
00000000001d0ef7	callq	__ZL22fillBufWithAsciiHexMD5PhS_ ## fillBufWithAsciiHexMD5(unsigned char*, unsigned char*)
00000000001d0efc	leaq	-0x80(%rbp), %rdi
00000000001d0f00	leaq	-0x50(%rbp), %rsi
00000000001d0f04	callq	__ZL22fillBufWithAsciiHexMD5PhS_ ## fillBufWithAsciiHexMD5(unsigned char*, unsigned char*)
00000000001d0f09	movl	$0x40, %edx
00000000001d0f0e	xorl	%edi, %edi
00000000001d0f10	movq	%r14, %rsi
00000000001d0f13	movl	$0x600, %ecx                    ## imm = 0x600
00000000001d0f18	xorl	%r8d, %r8d
00000000001d0f1b	callq	0x3c4b26                        ## symbol stub for: _CFStringCreateWithBytes
00000000001d0f20	movq	%rax, %r14
00000000001d0f23	movq	__ZN14HGColorConform15s_NodeListCacheE(%rip), %rdi ## HGColorConform::s_NodeListCache
00000000001d0f2a	callq	0x3c4ade                        ## symbol stub for: _CFDictionaryGetCount
00000000001d0f2f	cmpl	$0x32, %eax
00000000001d0f32	jne	0x1d0f63
00000000001d0f34	movq	__ZN14HGColorConform15s_NodeListCacheE(%rip), %rdi ## HGColorConform::s_NodeListCache
00000000001d0f3b	movq	__ZN14HGColorConform19s_LastAddedCacheKeyE(%rip), %rsi ## HGColorConform::s_LastAddedCacheKey
00000000001d0f42	callq	0x3c4aea                        ## symbol stub for: _CFDictionaryGetValue
00000000001d0f47	movq	(%rax), %rcx
00000000001d0f4a	movq	%rax, %rdi
00000000001d0f4d	callq	*0x18(%rcx)
00000000001d0f50	movq	__ZN14HGColorConform15s_NodeListCacheE(%rip), %rdi ## HGColorConform::s_NodeListCache
00000000001d0f57	movq	__ZN14HGColorConform19s_LastAddedCacheKeyE(%rip), %rsi ## HGColorConform::s_LastAddedCacheKey
00000000001d0f5e	callq	0x3c4af6                        ## symbol stub for: _CFDictionaryRemoveValue
00000000001d0f63	movq	__ZN14HGColorConform15s_NodeListCacheE(%rip), %rdi ## HGColorConform::s_NodeListCache
00000000001d0f6a	movq	%r14, %rsi
00000000001d0f6d	movq	%rbx, %rdx
00000000001d0f70	callq	0x3c4ac6                        ## symbol stub for: _CFDictionaryAddValue
00000000001d0f75	movq	__ZN14HGColorConform19s_LastAddedCacheKeyE(%rip), %rdi ## HGColorConform::s_LastAddedCacheKey
00000000001d0f7c	testq	%rdi, %rdi
00000000001d0f7f	je	0x1d0f86
00000000001d0f81	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001d0f86	movq	%r14, __ZN14HGColorConform19s_LastAddedCacheKeyE(%rip) ## HGColorConform::s_LastAddedCacheKey
00000000001d0f8d	movq	0x8312c4(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001d0f94	movq	(%rax), %rax
00000000001d0f97	cmpq	-0x30(%rbp), %rax
00000000001d0f9b	jne	0x1d0faf
00000000001d0f9d	movq	%rbx, %rax
00000000001d0fa0	addq	$0x78, %rsp
00000000001d0fa4	popq	%rbx
00000000001d0fa5	popq	%r12
00000000001d0fa7	popq	%r13
00000000001d0fa9	popq	%r14
00000000001d0fab	popq	%r15
00000000001d0fad	popq	%rbp
00000000001d0fae	retq
00000000001d0faf	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001d0fb4	movq	%rax, %r14
00000000001d0fb7	leaq	-0xa0(%rbp), %rdi
00000000001d0fbe	callq	__ZN14HGSynchronizerD1Ev        ## HGSynchronizer::~HGSynchronizer()
00000000001d0fc3	movq	%r14, %rdi
00000000001d0fc6	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0fcb	movq	%rax, %r14
00000000001d0fce	testl	%edx, %edx
00000000001d0fd0	je	0x1d0ff0
00000000001d0fd2	movq	%r14, %rdi
00000000001d0fd5	callq	___clang_call_terminate
00000000001d0fda	movq	%rax, %r14
00000000001d0fdd	movq	%rbx, %rdi
00000000001d0fe0	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001d0fe5	movq	%r14, %rdi
00000000001d0fe8	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0fed	movq	%rax, %r14
00000000001d0ff0	movq	%r14, %rdi
00000000001d0ff3	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0ff8	nopl	(%rax,%rax)
