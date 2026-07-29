__ZN14HGColorConform20GetNodeListFromCacheEPK16ColorSyncProfileS2_PP31HGColorConformNodeListCacheItem:
00000000001d09d0	pushq	%rbp
00000000001d09d1	movq	%rsp, %rbp
00000000001d09d4	pushq	%r15
00000000001d09d6	pushq	%r14
00000000001d09d8	pushq	%r13
00000000001d09da	pushq	%r12
00000000001d09dc	pushq	%rbx
00000000001d09dd	subq	$0x78, %rsp
00000000001d09e1	movq	%rdx, %rbx
00000000001d09e4	movq	%rsi, %r14
00000000001d09e7	movq	%rdi, %r15
00000000001d09ea	movq	0x831867(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001d09f1	movq	(%rax), %rax
00000000001d09f4	movq	%rax, -0x30(%rbp)
00000000001d09f8	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %r12 ## HGColorConform::s_NodeListCacheLock
00000000001d09ff	movq	%r12, -0xa0(%rbp)
00000000001d0a06	movb	$0x0, -0x98(%rbp)
00000000001d0a0d	movq	%r12, %rdi
00000000001d0a10	callq	__ZN16HGSynchronizable4LockEv   ## HGSynchronizable::Lock()
00000000001d0a15	movb	$0x1, %r13b
00000000001d0a18	cmpq	$0x0, __ZN14HGColorConform15s_NodeListCacheE(%rip) ## HGColorConform::s_NodeListCache
00000000001d0a20	jne	0x1d0a45
00000000001d0a22	movq	0x8316bf(%rip), %rdx            ## literal pool symbol address: _kCFTypeDictionaryKeyCallBacks
00000000001d0a29	movl	$0x32, %esi
00000000001d0a2e	xorl	%edi, %edi
00000000001d0a30	xorl	%ecx, %ecx
00000000001d0a32	callq	0x3c4ad8                        ## symbol stub for: _CFDictionaryCreateMutable
00000000001d0a37	movq	%rax, __ZN14HGColorConform15s_NodeListCacheE(%rip) ## HGColorConform::s_NodeListCache
00000000001d0a3e	testq	%rax, %rax
00000000001d0a41	setne	%r13b
00000000001d0a45	movq	%r12, %rdi
00000000001d0a48	callq	__ZN16HGSynchronizable6UnlockEv ## HGSynchronizable::Unlock()
00000000001d0a4d	testb	%r13b, %r13b
00000000001d0a50	je	0x1d0ace
00000000001d0a52	movq	%r15, %rdi
00000000001d0a55	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001d0a5a	movq	%rax, -0x40(%rbp)
00000000001d0a5e	movq	%rdx, -0x38(%rbp)
00000000001d0a62	movq	%r14, %rdi
00000000001d0a65	callq	0x3c4d9c                        ## symbol stub for: _ColorSyncProfileGetMD5
00000000001d0a6a	movq	%rax, -0x50(%rbp)
00000000001d0a6e	movq	%rdx, -0x48(%rbp)
00000000001d0a72	leaq	-0xa0(%rbp), %r14
00000000001d0a79	leaq	-0x40(%rbp), %rsi
00000000001d0a7d	movq	%r14, %rdi
00000000001d0a80	callq	__ZL22fillBufWithAsciiHexMD5PhS_ ## fillBufWithAsciiHexMD5(unsigned char*, unsigned char*)
00000000001d0a85	leaq	-0x80(%rbp), %rdi
00000000001d0a89	leaq	-0x50(%rbp), %rsi
00000000001d0a8d	callq	__ZL22fillBufWithAsciiHexMD5PhS_ ## fillBufWithAsciiHexMD5(unsigned char*, unsigned char*)
00000000001d0a92	movl	$0x40, %edx
00000000001d0a97	xorl	%edi, %edi
00000000001d0a99	movq	%r14, %rsi
00000000001d0a9c	movl	$0x600, %ecx                    ## imm = 0x600
00000000001d0aa1	xorl	%r8d, %r8d
00000000001d0aa4	callq	0x3c4b26                        ## symbol stub for: _CFStringCreateWithBytes
00000000001d0aa9	movq	%rax, %r14
00000000001d0aac	movq	__ZN14HGColorConform15s_NodeListCacheE(%rip), %rdi ## HGColorConform::s_NodeListCache
00000000001d0ab3	movq	%rax, %rsi
00000000001d0ab6	callq	0x3c4aea                        ## symbol stub for: _CFDictionaryGetValue
00000000001d0abb	movq	%rax, (%rbx)
00000000001d0abe	testq	%rax, %rax
00000000001d0ac1	setne	%bl
00000000001d0ac4	movq	%r14, %rdi
00000000001d0ac7	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001d0acc	jmp	0x1d0ad0
00000000001d0ace	xorl	%ebx, %ebx
00000000001d0ad0	movq	0x831781(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001d0ad7	movq	(%rax), %rax
00000000001d0ada	cmpq	-0x30(%rbp), %rax
00000000001d0ade	jne	0x1d0af1
00000000001d0ae0	movl	%ebx, %eax
00000000001d0ae2	addq	$0x78, %rsp
00000000001d0ae6	popq	%rbx
00000000001d0ae7	popq	%r12
00000000001d0ae9	popq	%r13
00000000001d0aeb	popq	%r14
00000000001d0aed	popq	%r15
00000000001d0aef	popq	%rbp
00000000001d0af0	retq
00000000001d0af1	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001d0af6	movq	%rax, %rbx
00000000001d0af9	leaq	-0xa0(%rbp), %rdi
00000000001d0b00	callq	__ZN14HGSynchronizerD1Ev        ## HGSynchronizer::~HGSynchronizer()
00000000001d0b05	movq	%rbx, %rdi
00000000001d0b08	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0b0d	movq	%rax, %rbx
00000000001d0b10	testl	%edx, %edx
00000000001d0b12	je	0x1d0b1f
00000000001d0b14	movq	%rbx, %rdi
00000000001d0b17	callq	___clang_call_terminate
00000000001d0b1c	movq	%rax, %rbx
00000000001d0b1f	movq	%rbx, %rdi
00000000001d0b22	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0b27	nopw	(%rax,%rax)
