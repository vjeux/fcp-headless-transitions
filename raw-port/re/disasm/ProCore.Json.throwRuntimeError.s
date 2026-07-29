__ZN4Json17throwRuntimeErrorERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE:
00000000000c6c75	pushq	%rbp
00000000000c6c76	movq	%rsp, %rbp
00000000000c6c79	pushq	%r14
00000000000c6c7b	pushq	%rbx
00000000000c6c7c	movq	%rdi, %r14
00000000000c6c7f	movl	$0x20, %edi
00000000000c6c84	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000c6c89	movq	%rax, %rbx
00000000000c6c8c	movq	%rax, %rdi
00000000000c6c8f	movq	%r14, %rsi
00000000000c6c92	callq	__ZN4Json12RuntimeErrorC2ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE ## Json::RuntimeError::RuntimeError(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&)
00000000000c6c97	leaq	__ZTIN4Json12RuntimeErrorE(%rip), %rsi ## typeinfo for Json::RuntimeError
00000000000c6c9e	leaq	__ZN4Json12RuntimeErrorD1Ev(%rip), %rdx ## Json::RuntimeError::~RuntimeError()
00000000000c6ca5	movq	%rbx, %rdi
00000000000c6ca8	callq	0xde71a                         ## symbol stub for: ___cxa_throw
00000000000c6cad	movq	%rax, %r14
00000000000c6cb0	movq	%rbx, %rdi
00000000000c6cb3	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
00000000000c6cb8	movq	%r14, %rdi
00000000000c6cbb	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
