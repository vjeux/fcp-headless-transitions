__ZN4Json15throwLogicErrorERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE:
00000000000ce05c	pushq	%rbp
00000000000ce05d	movq	%rsp, %rbp
00000000000ce060	pushq	%r14
00000000000ce062	pushq	%rbx
00000000000ce063	movq	%rdi, %r14
00000000000ce066	movl	$0x20, %edi
00000000000ce06b	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000ce070	movq	%rax, %rbx
00000000000ce073	movq	%rax, %rdi
00000000000ce076	movq	%r14, %rsi
00000000000ce079	callq	__ZN4Json10LogicErrorC1ERKNSt3__112basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEE ## Json::LogicError::LogicError(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&)
00000000000ce07e	leaq	__ZTIN4Json10LogicErrorE(%rip), %rsi ## typeinfo for Json::LogicError
00000000000ce085	leaq	__ZN4Json10LogicErrorD1Ev(%rip), %rdx ## Json::LogicError::~LogicError()
00000000000ce08c	movq	%rbx, %rdi
00000000000ce08f	callq	0xde71a                         ## symbol stub for: ___cxa_throw
00000000000ce094	movq	%rax, %r14
00000000000ce097	movq	%rbx, %rdi
00000000000ce09a	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
00000000000ce09f	movq	%r14, %rdi
00000000000ce0a2	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000ce0a7	nop
