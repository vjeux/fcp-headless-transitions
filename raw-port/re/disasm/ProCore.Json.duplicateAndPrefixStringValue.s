__ZN4JsonL29duplicateAndPrefixStringValueEPKcj:
00000000000ce51d	pushq	%rbp
00000000000ce51e	movq	%rsp, %rbp
00000000000ce521	pushq	%r15
00000000000ce523	pushq	%r14
00000000000ce525	pushq	%r12
00000000000ce527	pushq	%rbx
00000000000ce528	subq	$0x120, %rsp                    ## imm = 0x120
00000000000ce52f	cmpl	$0x7ffffffb, %esi               ## imm = 0x7FFFFFFB
00000000000ce535	jae	0xce57f
00000000000ce537	movl	%esi, %r14d
00000000000ce53a	movq	%rdi, %rbx
00000000000ce53d	leal	0x5(%r14), %edi
00000000000ce541	callq	0xde94e                         ## symbol stub for: _malloc
00000000000ce546	testq	%rax, %rax
00000000000ce549	je	0xce5bd
00000000000ce54b	movq	%rax, %r15
00000000000ce54e	movl	%r14d, %r12d
00000000000ce551	movl	%r14d, (%rax)
00000000000ce554	movq	%rax, %rdi
00000000000ce557	addq	$0x4, %rdi
00000000000ce55b	movq	%rbx, %rsi
00000000000ce55e	movq	%r12, %rdx
00000000000ce561	callq	0xde960                         ## symbol stub for: _memcpy
00000000000ce566	movb	$0x0, 0x4(%r15,%r12)
00000000000ce56c	movq	%r15, %rax
00000000000ce56f	addq	$0x120, %rsp                    ## imm = 0x120
00000000000ce576	popq	%rbx
00000000000ce577	popq	%r12
00000000000ce579	popq	%r14
00000000000ce57b	popq	%r15
00000000000ce57d	popq	%rbp
00000000000ce57e	retq
00000000000ce57f	leaq	-0x140(%rbp), %rbx
00000000000ce586	movq	%rbx, %rdi
00000000000ce589	callq	__ZNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106Ev ## std::__1::basic_ostringstream<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_ostringstream[abi:nqe210106]()
00000000000ce58e	leaq	0x68348(%rip), %rsi             ## literal pool for: "in Json::Value::duplicateAndPrefixStringValue(): length too big for prefixing"
00000000000ce595	movl	$0x4d, %edx
00000000000ce59a	movq	%rbx, %rdi
00000000000ce59d	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
00000000000ce5a2	leaq	-0x138(%rbp), %rsi
00000000000ce5a9	leaq	-0x38(%rbp), %rdi
00000000000ce5ad	callq	0xde522                         ## symbol stub for: __ZNKSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strEv
00000000000ce5b2	leaq	-0x38(%rbp), %rdi
00000000000ce5b6	callq	__ZN4Json15throwLogicErrorERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE ## Json::throwLogicError(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&)
00000000000ce5bb	jmp	0xce5db
00000000000ce5bd	leaq	0x68367(%rip), %rsi             ## literal pool for: "in Json::Value::duplicateAndPrefixStringValue(): Failed to allocate string value buffer"
00000000000ce5c4	leaq	-0x140(%rbp), %rbx
00000000000ce5cb	movq	%rbx, %rdi
00000000000ce5ce	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2B9nqe210106ILi0EEEPKc ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_string[abi:nqe210106]<0>(char const*)
00000000000ce5d3	movq	%rbx, %rdi
00000000000ce5d6	callq	__ZN4Json17throwRuntimeErrorERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE ## Json::throwRuntimeError(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&)
00000000000ce5db	ud2
00000000000ce5dd	movq	%rax, %rbx
00000000000ce5e0	testb	$0x1, -0x38(%rbp)
00000000000ce5e4	je	0xce5f6
00000000000ce5e6	movq	-0x28(%rbp), %rdi
00000000000ce5ea	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000ce5ef	jmp	0xce5f6
00000000000ce5f1	jmp	0xce5f3
00000000000ce5f3	movq	%rax, %rbx
00000000000ce5f6	leaq	-0x140(%rbp), %rdi
00000000000ce5fd	callq	__ZNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev ## std::__1::basic_ostringstream<char, std::__1::char_traits<char>, std::__1::allocator<char>>::~basic_ostringstream()
00000000000ce602	jmp	0xce61c
00000000000ce604	movq	%rax, %rbx
00000000000ce607	testb	$0x1, -0x140(%rbp)
00000000000ce60e	je	0xce61c
00000000000ce610	movq	-0x130(%rbp), %rdi
00000000000ce617	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000ce61c	movq	%rbx, %rdi
00000000000ce61f	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
