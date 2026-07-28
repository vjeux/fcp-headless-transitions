__ZN11PCExceptionC2ERKS_:
00000000000278f4	pushq	%rbp
00000000000278f5	movq	%rsp, %rbp
00000000000278f8	pushq	%r15
00000000000278fa	pushq	%r14
00000000000278fc	pushq	%r12
00000000000278fe	pushq	%rbx
00000000000278ff	movq	%rsi, %r15
0000000000027902	movq	%rdi, %rbx
0000000000027905	movq	0xa2ae4(%rip), %rax             ## literal pool symbol address: __ZTV11PCException
000000000002790c	addq	$0x10, %rax
0000000000027910	movq	%rax, (%rdi)
0000000000027913	movq	0x8(%rsi), %rdi
0000000000027917	movq	%rdi, 0x8(%rbx)
000000000002791b	testq	%rdi, %rdi
000000000002791e	je	0x27925
0000000000027920	callq	0xaca56                         ## symbol stub for: _CFRetain
0000000000027925	leaq	0x10(%rbx), %r14
0000000000027929	leaq	0x10(%r15), %rsi
000000000002792d	movq	%r14, %rdi
0000000000027930	callq	0xacd14                         ## symbol stub for: __ZN8PCStringC1ERKS_
0000000000027935	leaq	0x18(%rbx), %r12
0000000000027939	leaq	0x18(%r15), %rsi
000000000002793d	movq	%r12, %rdi
0000000000027940	callq	0xacd14                         ## symbol stub for: __ZN8PCStringC1ERKS_
0000000000027945	movl	0x20(%r15), %eax
0000000000027949	movl	%eax, 0x20(%rbx)
000000000002794c	leaq	0x28(%rbx), %rdi
0000000000027950	testb	$0x1, 0x28(%r15)
0000000000027955	jne	0x2796c
0000000000027957	addq	$0x28, %r15
000000000002795b	movq	0x10(%r15), %rax
000000000002795f	movq	%rax, 0x10(%rdi)
0000000000027963	movups	(%r15), %xmm0
0000000000027967	movups	%xmm0, (%rdi)
000000000002796a	jmp	0x27979
000000000002796c	movq	0x30(%r15), %rdx
0000000000027970	movq	0x38(%r15), %rsi
0000000000027974	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__init_copy_ctor_external(char const*, unsigned long)
0000000000027979	popq	%rbx
000000000002797a	popq	%r12
000000000002797c	popq	%r14
000000000002797e	popq	%r15
0000000000027980	popq	%rbp
0000000000027981	retq
0000000000027982	movq	%rax, %r15
0000000000027985	movq	%r12, %rdi
0000000000027988	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000002798d	jmp	0x27997
000000000002798f	movq	%rax, %r15
0000000000027992	jmp	0x279ad
0000000000027994	movq	%rax, %r15
0000000000027997	movq	%r14, %rdi
000000000002799a	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000002799f	jmp	0x279a4
00000000000279a1	movq	%rax, %r15
00000000000279a4	leaq	0x8(%rbx), %rdi
00000000000279a8	callq	__ZN7PCCFRefIPK9__CFArrayED2Ev  ## PCCFRef<__CFArray const*>::~PCCFRef()
00000000000279ad	movq	%rbx, %rdi
00000000000279b0	callq	0xacdf2                         ## symbol stub for: __ZNSt9exceptionD2Ev
00000000000279b5	movq	%r15, %rdi
00000000000279b8	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000279bd	nop
