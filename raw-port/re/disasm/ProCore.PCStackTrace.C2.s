__ZN12PCStackTraceC2Ei:
000000000006f512	pushq	%rbp
000000000006f513	movq	%rsp, %rbp
000000000006f516	pushq	%r15
000000000006f518	pushq	%r14
000000000006f51a	pushq	%r13
000000000006f51c	pushq	%r12
000000000006f51e	pushq	%rbx
000000000006f51f	subq	$0x1d8, %rsp                    ## imm = 0x1D8
000000000006f526	xorps	%xmm0, %xmm0
000000000006f529	movups	%xmm0, (%rdi)
000000000006f52c	movq	%rdi, -0x80(%rbp)
000000000006f530	movq	$0x0, 0x10(%rdi)
000000000006f538	movq	%rsi, -0xa8(%rbp)
000000000006f53f	leal	0x5(%rsi), %ebx
000000000006f542	movslq	%ebx, %rsi
000000000006f545	leaq	-0x98(%rbp), %rdi
000000000006f54c	callq	__ZNSt3__16vectorIPvNS_9allocatorIS1_EEEC2B9nqe210106Em ## std::__1::vector<void*, std::__1::allocator<void*>>::vector[abi:nqe210106](unsigned long)
000000000006f551	movq	-0x98(%rbp), %rdi
000000000006f558	movl	%ebx, %esi
000000000006f55a	callq	0xde798                         ## symbol stub for: _backtrace
000000000006f55f	testl	%eax, %eax
000000000006f561	je	0x6fb2e
000000000006f567	movq	0xd8b82(%rip), %rcx             ## literal pool symbol address: __ZTTNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE
000000000006f56e	movq	(%rcx), %rdx
000000000006f571	movq	%rdx, -0xd0(%rbp)
000000000006f578	movq	0x18(%rcx), %rdx
000000000006f57c	movq	%rdx, -0xc8(%rbp)
000000000006f583	movl	%eax, %eax
000000000006f585	movq	%rax, -0xb0(%rbp)
000000000006f58c	xorl	%ebx, %ebx
000000000006f58e	leaq	-0x200(%rbp), %r14
000000000006f595	movq	0xd8b6c(%rip), %rax             ## literal pool symbol address: __ZTVNSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE
000000000006f59c	addq	$0x10, %rax
000000000006f5a0	movq	%rax, -0xc0(%rbp)
000000000006f5a7	movq	0xd8b52(%rip), %rax             ## literal pool symbol address: __ZTVNSt3__115basic_streambufIcNS_11char_traitsIcEEEE
000000000006f5ae	addq	$0x10, %rax
000000000006f5b2	movq	%rax, -0xb8(%rbp)
000000000006f5b9	addq	$0x8, %rcx
000000000006f5bd	movq	%rcx, -0xd8(%rbp)
000000000006f5c4	xorl	%r12d, %r12d
000000000006f5c7	movq	%r14, %rdi
000000000006f5ca	callq	__ZNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106Ev ## std::__1::basic_ostringstream<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_ostringstream[abi:nqe210106]()
000000000006f5cf	movq	-0x98(%rbp), %rax
000000000006f5d6	movq	(%rax,%rbx,8), %rdi
000000000006f5da	leaq	-0xf8(%rbp), %rsi
000000000006f5e1	callq	0xde83a                         ## symbol stub for: _dladdr
000000000006f5e6	testl	%eax, %eax
000000000006f5e8	je	0x6f637
000000000006f5ea	movl	%r12d, -0x44(%rbp)
000000000006f5ee	movq	-0xe8(%rbp), %r15
000000000006f5f5	movq	%r15, %rdi
000000000006f5f8	xorl	%esi, %esi
000000000006f5fa	xorl	%edx, %edx
000000000006f5fc	xorl	%ecx, %ecx
000000000006f5fe	callq	0xde6f0                         ## symbol stub for: ___cxa_demangle
000000000006f603	movq	%rax, %r12
000000000006f606	xorps	%xmm0, %xmm0
000000000006f609	movaps	%xmm0, -0x60(%rbp)
000000000006f60d	movq	$0x0, -0x50(%rbp)
000000000006f615	testq	%rax, %rax
000000000006f618	je	0x6f767
000000000006f61e	leaq	-0x60(%rbp), %rdi
000000000006f622	movq	%r12, %rsi
000000000006f625	callq	0xde56a                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc
000000000006f62a	movq	%r12, %rdi
000000000006f62d	callq	0xde89a                         ## symbol stub for: _free
000000000006f632	jmp	0x6f773
000000000006f637	movq	-0x200(%rbp), %rax
000000000006f63e	movq	-0x18(%rax), %rcx
000000000006f642	movl	-0x1f8(%rbp,%rcx), %edx
000000000006f649	movl	$0xffffff4f, %esi               ## imm = 0xFFFFFF4F
000000000006f64e	andl	%esi, %edx
000000000006f650	orl	$0x20, %edx
000000000006f653	movl	%edx, -0x1f8(%rbp,%rcx)
000000000006f65a	movq	-0x18(%rax), %rax
000000000006f65e	movq	$0x3, -0x1e8(%rbp,%rax)
000000000006f66a	movq	%r14, %rdi
000000000006f66d	movl	%r12d, %esi
000000000006f670	callq	0xde600                         ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEi
000000000006f675	movl	$0x1, %edx
000000000006f67a	movq	%rax, %rdi
000000000006f67d	leaq	0xc2773(%rip), %rsi             ## literal pool for: " "
000000000006f684	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f689	movq	-0x200(%rbp), %rax
000000000006f690	movq	-0x18(%rax), %rcx
000000000006f694	movl	-0x1f8(%rbp,%rcx), %edx
000000000006f69b	movl	$0xffffff4f, %esi               ## imm = 0xFFFFFF4F
000000000006f6a0	andl	%esi, %edx
000000000006f6a2	orl	$0x20, %edx
000000000006f6a5	movl	%edx, -0x1f8(%rbp,%rcx)
000000000006f6ac	movq	-0x18(%rax), %rax
000000000006f6b0	movq	$0x23, -0x1e8(%rbp,%rax)
000000000006f6bc	movl	$0x10, %edx
000000000006f6c1	movq	%r14, %rdi
000000000006f6c4	leaq	0xc39f4(%rip), %rsi             ## literal pool for: "<unknown binary>"
000000000006f6cb	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f6d0	movl	$0x1, %edx
000000000006f6d5	movq	%rax, %rdi
000000000006f6d8	leaq	0xc2718(%rip), %rsi             ## literal pool for: " "
000000000006f6df	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f6e4	movq	-0x200(%rbp), %rax
000000000006f6eb	movq	-0x18(%rax), %rcx
000000000006f6ef	movq	$0x12, -0x1e8(%rbp,%rcx)
000000000006f6fb	movq	-0x18(%rax), %rax
000000000006f6ff	movl	-0x1f8(%rbp,%rax), %ecx
000000000006f706	movl	$0xffffff4f, %edx               ## imm = 0xFFFFFF4F
000000000006f70b	andl	%edx, %ecx
000000000006f70d	orl	$0x10, %ecx
000000000006f710	movl	%ecx, -0x1f8(%rbp,%rax)
000000000006f717	movb	$0x30, -0x40(%rbp)
000000000006f71b	movq	%r14, %rdi
000000000006f71e	leaq	-0x40(%rbp), %rsi
000000000006f722	callq	__ZNSt3__1lsB9nqe210106INS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_RKNS_8__iom_t4IcEE ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::operator<<[abi:nqe210106]<std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, std::__1::__iom_t4<char> const&)
000000000006f727	movq	-0x98(%rbp), %rcx
000000000006f72e	movq	(%rcx,%rbx,8), %rsi
000000000006f732	movq	%rax, %rdi
000000000006f735	callq	0xde5e2                         ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEPKv
000000000006f73a	movl	$0x1, %edx
000000000006f73f	movq	%rax, %rdi
000000000006f742	leaq	0xc26ae(%rip), %rsi             ## literal pool for: " "
000000000006f749	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f74e	movl	$0x12, %edx
000000000006f753	movq	%r14, %rdi
000000000006f756	leaq	0xc3973(%rip), %rsi             ## literal pool for: "<unknown function>"
000000000006f75d	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f762	jmp	0x6fa5d
000000000006f767	leaq	-0x60(%rbp), %rdi
000000000006f76b	movq	%r15, %rsi
000000000006f76e	callq	0xde56a                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc
000000000006f773	leaq	-0x40(%rbp), %rdi
000000000006f777	leaq	0xc3968(%rip), %rsi             ## literal pool for: "PCStackTrace"
000000000006f77e	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2B9nqe210106ILi0EEEPKc ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_string[abi:nqe210106]<0>(char const*)
000000000006f783	movzbl	-0x40(%rbp), %edx
000000000006f787	testb	$0x1, %dl
000000000006f78a	je	0x6f792
000000000006f78c	movq	-0x38(%rbp), %rdx
000000000006f790	jmp	0x6f794
000000000006f792	shrl	%edx
000000000006f794	leaq	-0x60(%rbp), %rdi
000000000006f798	xorl	%esi, %esi
000000000006f79a	leaq	-0x40(%rbp), %rcx
000000000006f79e	xorl	%r8d, %r8d
000000000006f7a1	movq	$-0x1, %r9
000000000006f7a8	callq	0xde51c                         ## symbol stub for: __ZNKSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEmmRKS5_mm
000000000006f7ad	testl	%eax, %eax
000000000006f7af	je	0x6f7d0
000000000006f7b1	leaq	-0x78(%rbp), %rdi
000000000006f7b5	leaq	0xc3937(%rip), %rsi             ## literal pool for: "PCLiveObjects"
000000000006f7bc	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2B9nqe210106ILi0EEEPKc ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_string[abi:nqe210106]<0>(char const*)
000000000006f7c1	movzbl	-0x78(%rbp), %edx
000000000006f7c5	testb	$0x1, %dl
000000000006f7c8	je	0x6f7d5
000000000006f7ca	movq	-0x70(%rbp), %rdx
000000000006f7ce	jmp	0x6f7d7
000000000006f7d0	movb	$0x1, %r12b
000000000006f7d3	jmp	0x6f805
000000000006f7d5	shrl	%edx
000000000006f7d7	leaq	-0x60(%rbp), %rdi
000000000006f7db	xorl	%esi, %esi
000000000006f7dd	leaq	-0x78(%rbp), %rcx
000000000006f7e1	xorl	%r8d, %r8d
000000000006f7e4	movq	$-0x1, %r9
000000000006f7eb	callq	0xde51c                         ## symbol stub for: __ZNKSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7compareEmmRKS5_mm
000000000006f7f0	testl	%eax, %eax
000000000006f7f2	sete	%r12b
000000000006f7f6	testb	$0x1, -0x78(%rbp)
000000000006f7fa	je	0x6f805
000000000006f7fc	movq	-0x68(%rbp), %rdi
000000000006f800	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006f805	testb	$0x1, -0x40(%rbp)
000000000006f809	je	0x6f814
000000000006f80b	movq	-0x30(%rbp), %rdi
000000000006f80f	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006f814	movl	$0x4, %r15d
000000000006f81a	testb	%r12b, %r12b
000000000006f81d	jne	0x6fa45
000000000006f823	movq	-0x200(%rbp), %rax
000000000006f82a	movq	-0x18(%rax), %rcx
000000000006f82e	movl	-0x1f8(%rbp,%rcx), %edx
000000000006f835	movl	$0xffffff4f, %esi               ## imm = 0xFFFFFF4F
000000000006f83a	andl	%esi, %edx
000000000006f83c	orl	$0x20, %edx
000000000006f83f	movl	%edx, -0x1f8(%rbp,%rcx)
000000000006f846	movq	-0x18(%rax), %rax
000000000006f84a	movq	$0x3, -0x1e8(%rbp,%rax)
000000000006f856	movq	%r14, %rdi
000000000006f859	movl	-0x44(%rbp), %esi
000000000006f85c	callq	0xde600                         ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEi
000000000006f861	movl	$0x1, %edx
000000000006f866	movq	%rax, %rdi
000000000006f869	leaq	0xc2587(%rip), %rsi             ## literal pool for: " "
000000000006f870	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f875	movq	-0xf8(%rbp), %rsi
000000000006f87c	leaq	-0x78(%rbp), %r15
000000000006f880	movq	%r15, %rdi
000000000006f883	xorl	%edx, %edx
000000000006f885	callq	__ZN5PCURLC1EPKcb               ## PCURL::PCURL(char const*, bool)
000000000006f88a	leaq	-0xa0(%rbp), %r13
000000000006f891	movq	%r13, %rdi
000000000006f894	movq	%r15, %rsi
000000000006f897	callq	__ZNK5PCURL11getFilenameEv      ## PCURL::getFilename() const
000000000006f89c	movq	%r13, %rdi
000000000006f89f	callq	__ZNK8PCString10createCStrEv    ## PCString::createCStr() const
000000000006f8a4	movq	%rax, %r15
000000000006f8a7	leaq	-0x40(%rbp), %rdi
000000000006f8ab	movq	%rax, %rsi
000000000006f8ae	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2B9nqe210106ILi0EEEPKc ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_string[abi:nqe210106]<0>(char const*)
000000000006f8b3	movq	%r15, %rdi
000000000006f8b6	callq	0xde89a                         ## symbol stub for: _free
000000000006f8bb	leaq	-0xa0(%rbp), %rdi
000000000006f8c2	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
000000000006f8c7	leaq	-0x78(%rbp), %rdi
000000000006f8cb	callq	__ZN5PCURLD1Ev                  ## PCURL::~PCURL()
000000000006f8d0	movzbl	-0x40(%rbp), %ecx
000000000006f8d4	movl	%ecx, %edx
000000000006f8d6	shrl	%edx
000000000006f8d8	andb	$0x1, %cl
000000000006f8db	movq	-0x38(%rbp), %rax
000000000006f8df	movq	%rax, %rsi
000000000006f8e2	cmoveq	%rdx, %rsi
000000000006f8e6	cmpq	$0x24, %rsi
000000000006f8ea	jb	0x6f910
000000000006f8ec	movl	$0x23, %esi
000000000006f8f1	leaq	-0x40(%rbp), %rdi
000000000006f8f5	movq	$-0x1, %rdx
000000000006f8fc	callq	0xde558                         ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE5eraseEmm
000000000006f901	movzbl	-0x40(%rbp), %edx
000000000006f905	movq	-0x38(%rbp), %rax
000000000006f909	movl	%edx, %ecx
000000000006f90b	andb	$0x1, %cl
000000000006f90e	shrl	%edx
000000000006f910	movq	-0x200(%rbp), %rsi
000000000006f917	movq	-0x18(%rsi), %rsi
000000000006f91b	movq	$0x23, -0x1e8(%rbp,%rsi)
000000000006f927	leaq	-0x3f(%rbp), %rsi
000000000006f92b	testb	%cl, %cl
000000000006f92d	je	0x6f936
000000000006f92f	movq	-0x30(%rbp), %rsi
000000000006f933	movq	%rax, %rdx
000000000006f936	movq	%r14, %rdi
000000000006f939	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f93e	movl	$0x1, %edx
000000000006f943	movq	%rax, %rdi
000000000006f946	leaq	0xc24aa(%rip), %rsi             ## literal pool for: " "
000000000006f94d	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f952	movq	-0x200(%rbp), %rax
000000000006f959	movq	-0x18(%rax), %rcx
000000000006f95d	movq	$0x12, -0x1e8(%rbp,%rcx)
000000000006f969	movq	-0x18(%rax), %rax
000000000006f96d	movl	-0x1f8(%rbp,%rax), %ecx
000000000006f974	movl	$0xffffff4f, %edx               ## imm = 0xFFFFFF4F
000000000006f979	andl	%edx, %ecx
000000000006f97b	orl	$0x10, %ecx
000000000006f97e	movl	%ecx, -0x1f8(%rbp,%rax)
000000000006f985	movb	$0x30, -0x78(%rbp)
000000000006f989	movq	%r14, %rdi
000000000006f98c	leaq	-0x78(%rbp), %rsi
000000000006f990	callq	__ZNSt3__1lsB9nqe210106INS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_RKNS_8__iom_t4IcEE ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::operator<<[abi:nqe210106]<std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, std::__1::__iom_t4<char> const&)
000000000006f995	movq	-0xe0(%rbp), %rsi
000000000006f99c	movq	%rax, %rdi
000000000006f99f	callq	0xde5e2                         ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEPKv
000000000006f9a4	movl	$0x1, %edx
000000000006f9a9	movq	%rax, %rdi
000000000006f9ac	leaq	0xc2444(%rip), %rsi             ## literal pool for: " "
000000000006f9b3	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f9b8	movq	-0x200(%rbp), %rax
000000000006f9bf	movq	-0x18(%rax), %rax
000000000006f9c3	movq	$0x1, -0x1e8(%rbp,%rax)
000000000006f9cf	movzbl	-0x60(%rbp), %edx
000000000006f9d3	testb	$0x1, %dl
000000000006f9d6	je	0x6f9e2
000000000006f9d8	movq	-0x50(%rbp), %rsi
000000000006f9dc	movq	-0x58(%rbp), %rdx
000000000006f9e0	jmp	0x6f9e8
000000000006f9e2	shrl	%edx
000000000006f9e4	leaq	-0x5f(%rbp), %rsi
000000000006f9e8	movq	%r14, %rdi
000000000006f9eb	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006f9f0	movl	$0x3, %edx
000000000006f9f5	movq	%rax, %rdi
000000000006f9f8	leaq	0xc36bc(%rip), %rsi             ## literal pool for: " + "
000000000006f9ff	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000006fa04	movq	(%rax), %rcx
000000000006fa07	movq	-0x18(%rcx), %rcx
000000000006fa0b	movl	0x8(%rax,%rcx), %edx
000000000006fa0f	andl	$-0x4b, %edx
000000000006fa12	orl	$0x2, %edx
000000000006fa15	movl	%edx, 0x8(%rax,%rcx)
000000000006fa19	movq	-0x98(%rbp), %rcx
000000000006fa20	movq	(%rcx,%rbx,8), %rsi
000000000006fa24	subq	-0xe0(%rbp), %rsi
000000000006fa2b	movq	%rax, %rdi
000000000006fa2e	callq	0xde60c                         ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEl
000000000006fa33	testb	$0x1, -0x40(%rbp)
000000000006fa37	je	0x6fa42
000000000006fa39	movq	-0x30(%rbp), %rdi
000000000006fa3d	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fa42	xorl	%r15d, %r15d
000000000006fa45	testb	$0x1, -0x60(%rbp)
000000000006fa49	je	0x6fa54
000000000006fa4b	movq	-0x50(%rbp), %rdi
000000000006fa4f	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fa54	testb	%r12b, %r12b
000000000006fa57	movl	-0x44(%rbp), %r12d
000000000006fa5b	jne	0x6fa9f
000000000006fa5d	leaq	-0x40(%rbp), %r15
000000000006fa61	movq	%r15, %rdi
000000000006fa64	leaq	-0x1f8(%rbp), %rsi
000000000006fa6b	callq	0xde522                         ## symbol stub for: __ZNKSt3__115basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEE3strEv
000000000006fa70	movq	-0x80(%rbp), %rdi
000000000006fa74	movq	%r15, %rsi
000000000006fa77	callq	__ZNSt3__16vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE9push_backB9nqe210106EOS6_ ## std::__1::vector<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>, std::__1::allocator<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>>::push_back[abi:nqe210106](std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>&&)
000000000006fa7c	testb	$0x1, -0x40(%rbp)
000000000006fa80	je	0x6fa8b
000000000006fa82	movq	-0x30(%rbp), %rdi
000000000006fa86	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fa8b	incl	%r12d
000000000006fa8e	xorl	%r15d, %r15d
000000000006fa91	cmpl	-0xa8(%rbp), %r12d
000000000006fa98	sete	%r15b
000000000006fa9c	addl	%r15d, %r15d
000000000006fa9f	movq	-0xd0(%rbp), %rax
000000000006faa6	movq	%rax, -0x200(%rbp)
000000000006faad	movq	-0x18(%rax), %rax
000000000006fab1	movq	-0xc8(%rbp), %rcx
000000000006fab8	movq	%rcx, -0x200(%rbp,%rax)
000000000006fac0	movq	-0xc0(%rbp), %rax
000000000006fac7	movq	%rax, -0x1f8(%rbp)
000000000006face	testb	$0x1, -0x1b8(%rbp)
000000000006fad5	je	0x6fae3
000000000006fad7	movq	-0x1a8(%rbp), %rdi
000000000006fade	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fae3	movq	-0xb8(%rbp), %rax
000000000006faea	movq	%rax, -0x1f8(%rbp)
000000000006faf1	leaq	-0x1f0(%rbp), %rdi
000000000006faf8	callq	0xde678                         ## symbol stub for: __ZNSt3__16localeD1Ev
000000000006fafd	movq	%r14, %rdi
000000000006fb00	movq	-0xd8(%rbp), %rsi
000000000006fb07	callq	0xde5dc                         ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED2Ev
000000000006fb0c	leaq	-0x190(%rbp), %rdi
000000000006fb13	callq	0xde69c                         ## symbol stub for: __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev
000000000006fb18	testb	$0x3, %r15b
000000000006fb1c	jne	0x6fb2e
000000000006fb1e	incq	%rbx
000000000006fb21	cmpq	%rbx, -0xb0(%rbp)
000000000006fb28	jne	0x6f5c7
000000000006fb2e	movq	-0x98(%rbp), %rdi
000000000006fb35	testq	%rdi, %rdi
000000000006fb38	je	0x6fb46
000000000006fb3a	movq	%rdi, -0x90(%rbp)
000000000006fb41	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fb46	addq	$0x1d8, %rsp                    ## imm = 0x1D8
000000000006fb4d	popq	%rbx
000000000006fb4e	popq	%r12
000000000006fb50	popq	%r13
000000000006fb52	popq	%r14
000000000006fb54	popq	%r15
000000000006fb56	popq	%rbp
000000000006fb57	retq
000000000006fb58	jmp	0x6fbe7
000000000006fb5d	movq	%rax, %rbx
000000000006fb60	jmp	0x6fc15
000000000006fb65	jmp	0x6fbc4
000000000006fb67	movq	%rax, %rbx
000000000006fb6a	jmp	0x6fb93
000000000006fb6c	jmp	0x6fba8
000000000006fb6e	movq	%rax, %rbx
000000000006fb71	testb	$0x1, -0x78(%rbp)
000000000006fb75	je	0x6fbc7
000000000006fb77	movq	-0x68(%rbp), %rdi
000000000006fb7b	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fb80	jmp	0x6fbc7
000000000006fb82	jmp	0x6fbc4
000000000006fb84	movq	%rax, %rbx
000000000006fb87	leaq	-0xa0(%rbp), %rdi
000000000006fb8e	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
000000000006fb93	leaq	-0x78(%rbp), %rdi
000000000006fb97	callq	__ZN5PCURLD1Ev                  ## PCURL::~PCURL()
000000000006fb9c	jmp	0x6fbd6
000000000006fb9e	jmp	0x6fba8
000000000006fba0	jmp	0x6fbc4
000000000006fba2	jmp	0x6fbee
000000000006fba4	jmp	0x6fbc4
000000000006fba6	jmp	0x6fba8
000000000006fba8	movq	%rax, %rbx
000000000006fbab	jmp	0x6fbd6
000000000006fbad	movq	%rax, %rbx
000000000006fbb0	testb	$0x1, -0x40(%rbp)
000000000006fbb4	je	0x6fbf1
000000000006fbb6	movq	-0x30(%rbp), %rdi
000000000006fbba	jmp	0x6fbe0
000000000006fbbc	jmp	0x6fbee
000000000006fbbe	jmp	0x6fbee
000000000006fbc0	jmp	0x6fbee
000000000006fbc2	jmp	0x6fbc4
000000000006fbc4	movq	%rax, %rbx
000000000006fbc7	testb	$0x1, -0x40(%rbp)
000000000006fbcb	je	0x6fbd6
000000000006fbcd	movq	-0x30(%rbp), %rdi
000000000006fbd1	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fbd6	testb	$0x1, -0x60(%rbp)
000000000006fbda	je	0x6fbf1
000000000006fbdc	movq	-0x50(%rbp), %rdi
000000000006fbe0	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fbe5	jmp	0x6fbf1
000000000006fbe7	movq	%rax, %rbx
000000000006fbea	jmp	0x6fbfd
000000000006fbec	jmp	0x6fbee
000000000006fbee	movq	%rax, %rbx
000000000006fbf1	leaq	-0x200(%rbp), %rdi
000000000006fbf8	callq	__ZNSt3__119basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev ## std::__1::basic_ostringstream<char, std::__1::char_traits<char>, std::__1::allocator<char>>::~basic_ostringstream()
000000000006fbfd	movq	-0x98(%rbp), %rdi
000000000006fc04	testq	%rdi, %rdi
000000000006fc07	je	0x6fc15
000000000006fc09	movq	%rdi, -0x90(%rbp)
000000000006fc10	callq	0xde6c0                         ## symbol stub for: __ZdlPv
000000000006fc15	leaq	-0x200(%rbp), %rdi
000000000006fc1c	movq	-0x80(%rbp), %rax
000000000006fc20	movq	%rax, (%rdi)
000000000006fc23	callq	__ZNSt3__16vectorINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS4_IS6_EEE16__destroy_vectorclB9nqe210106Ev ## std::__1::vector<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>, std::__1::allocator<std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>>::__destroy_vector::operator()[abi:nqe210106]()
000000000006fc28	movq	%rbx, %rdi
000000000006fc2b	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
