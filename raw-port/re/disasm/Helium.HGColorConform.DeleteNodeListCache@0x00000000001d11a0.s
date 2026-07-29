__ZN14HGColorConform19DeleteNodeListCacheEv:
00000000001d11a0	pushq	%rbp
00000000001d11a1	movq	%rsp, %rbp
00000000001d11a4	pushq	%r15
00000000001d11a6	pushq	%r14
00000000001d11a8	pushq	%r12
00000000001d11aa	pushq	%rbx
00000000001d11ab	movq	__ZN14HGColorConform15s_NodeListCacheE(%rip), %rdi ## HGColorConform::s_NodeListCache
00000000001d11b2	testq	%rdi, %rdi
00000000001d11b5	je	0x1d1259
00000000001d11bb	callq	0x3c4ade                        ## symbol stub for: _CFDictionaryGetCount
00000000001d11c0	movq	%rax, %rbx
00000000001d11c3	testl	%ebx, %ebx
00000000001d11c5	jle	0x1d1222
00000000001d11c7	andl	$0x7fffffff, %ebx               ## imm = 0x7FFFFFFF
00000000001d11cd	leaq	(,%rbx,8), %r15
00000000001d11d5	movq	%r15, %rdi
00000000001d11d8	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000001d11dd	movq	%rax, %r14
00000000001d11e0	movq	%r15, %rdi
00000000001d11e3	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000001d11e8	movq	%rax, %r15
00000000001d11eb	movq	__ZN14HGColorConform15s_NodeListCacheE(%rip), %rdi ## HGColorConform::s_NodeListCache
00000000001d11f2	movq	%r14, %rsi
00000000001d11f5	movq	%rax, %rdx
00000000001d11f8	callq	0x3c4ae4                        ## symbol stub for: _CFDictionaryGetKeysAndValues
00000000001d11fd	xorl	%r12d, %r12d
00000000001d1200	movq	(%r15,%r12,8), %rdi
00000000001d1204	movq	(%rdi), %rax
00000000001d1207	callq	*0x18(%rax)
00000000001d120a	incq	%r12
00000000001d120d	cmpq	%r12, %rbx
00000000001d1210	jne	0x1d1200
00000000001d1212	movq	%r14, %rdi
00000000001d1215	callq	0x3c4f9a                        ## symbol stub for: __ZdaPv
00000000001d121a	movq	%r15, %rdi
00000000001d121d	callq	0x3c4f9a                        ## symbol stub for: __ZdaPv
00000000001d1222	movq	__ZN14HGColorConform19s_LastAddedCacheKeyE(%rip), %rdi ## HGColorConform::s_LastAddedCacheKey
00000000001d1229	testq	%rdi, %rdi
00000000001d122c	je	0x1d1233
00000000001d122e	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001d1233	movq	__ZN14HGColorConform15s_NodeListCacheE(%rip), %rdi ## HGColorConform::s_NodeListCache
00000000001d123a	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001d123f	movq	__ZN14HGColorConform19s_NodeListCacheLockE(%rip), %rdi ## HGColorConform::s_NodeListCacheLock
00000000001d1246	testq	%rdi, %rdi
00000000001d1249	je	0x1d1259
00000000001d124b	movq	(%rdi), %rax
00000000001d124e	popq	%rbx
00000000001d124f	popq	%r12
00000000001d1251	popq	%r14
00000000001d1253	popq	%r15
00000000001d1255	popq	%rbp
00000000001d1256	jmpq	*0x8(%rax)
00000000001d1259	popq	%rbx
00000000001d125a	popq	%r12
00000000001d125c	popq	%r14
00000000001d125e	popq	%r15
00000000001d1260	popq	%rbp
00000000001d1261	retq
00000000001d1262	nopw	%cs:(%rax,%rax)
