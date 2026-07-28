__ZN16LiAttributeStackD2Ev:
000000000023ab90	pushq	%rbp
000000000023ab91	movq	%rsp, %rbp
000000000023ab94	pushq	%r15
000000000023ab96	pushq	%r14
000000000023ab98	pushq	%r13
000000000023ab9a	pushq	%r12
000000000023ab9c	pushq	%rbx
000000000023ab9d	pushq	%rax
000000000023ab9e	movq	%rdi, %rbx
000000000023aba1	movl	(%rdi), %eax
000000000023aba3	leal	-0x1(%rax), %ecx
000000000023aba6	movl	%ecx, (%rdi)
000000000023aba8	testl	%eax, %eax
000000000023abaa	jle	0x23ac48
000000000023abb0	leaq	-0x30(%rbp), %r12
000000000023abb4	movq	0x5eb675(%rip), %r13            ## literal pool symbol address: __ZNSt3__15ctypeIcE2idE
000000000023abbb	jmp	0x23abcb
000000000023abbd	nopl	(%rax)
000000000023abc0	movl	(%rbx), %eax
000000000023abc2	leal	-0x1(%rax), %ecx
000000000023abc5	movl	%ecx, (%rbx)
000000000023abc7	testl	%eax, %eax
000000000023abc9	jle	0x23ac48
000000000023abcb	movq	0x8(%rbx), %rax
000000000023abcf	movq	(%rax), %rdi
000000000023abd2	callq	*0x660(%rax)
000000000023abd8	cmpb	$0x1, 0x4(%rbx)
000000000023abdc	jne	0x23abc0
000000000023abde	movl	$0xe, %edx
000000000023abe3	movq	0x5eb636(%rip), %rdi            ## literal pool symbol address: __ZNSt3__14cerrE
000000000023abea	leaq	0x595b4f(%rip), %rsi            ## literal pool for: "gl.popAttrib()"
000000000023abf1	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000023abf6	movq	%rax, %r14
000000000023abf9	movq	(%rax), %rax
000000000023abfc	movq	-0x18(%rax), %rsi
000000000023ac00	addq	%r14, %rsi
000000000023ac03	movq	%r12, %rdi
000000000023ac06	callq	0x6dfb16                        ## symbol stub for: __ZNKSt3__18ios_base6getlocEv
000000000023ac0b	movq	%r12, %rdi
000000000023ac0e	movq	%r13, %rsi
000000000023ac11	callq	0x6dfb10                        ## symbol stub for: __ZNKSt3__16locale9use_facetERNS0_2idE
000000000023ac16	movq	(%rax), %rcx
000000000023ac19	movq	%rax, %rdi
000000000023ac1c	movl	$0xa, %esi
000000000023ac21	callq	*0x38(%rcx)
000000000023ac24	movl	%eax, %r15d
000000000023ac27	movq	%r12, %rdi
000000000023ac2a	callq	0x6dfbf4                        ## symbol stub for: __ZNSt3__16localeD1Ev
000000000023ac2f	movsbl	%r15b, %esi
000000000023ac33	movq	%r14, %rdi
000000000023ac36	callq	0x6dfb64                        ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc
000000000023ac3b	movq	%r14, %rdi
000000000023ac3e	callq	0x6dfb6a                        ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv
000000000023ac43	jmp	0x23abc0
000000000023ac48	addq	$0x8, %rbx
000000000023ac4c	movq	%rbx, %rdi
000000000023ac4f	callq	0x6de9b2                        ## symbol stub for: __ZN5ProGL2GLD1Ev
000000000023ac54	addq	$0x8, %rsp
000000000023ac58	popq	%rbx
000000000023ac59	popq	%r12
000000000023ac5b	popq	%r13
000000000023ac5d	popq	%r14
000000000023ac5f	popq	%r15
000000000023ac61	popq	%rbp
000000000023ac62	retq
000000000023ac63	movq	%rax, %rbx
000000000023ac66	leaq	-0x30(%rbp), %rdi
000000000023ac6a	callq	0x6dfbf4                        ## symbol stub for: __ZNSt3__16localeD1Ev
000000000023ac6f	movq	%rbx, %rdi
000000000023ac72	callq	___clang_call_terminate
000000000023ac77	movq	%rax, %rdi
000000000023ac7a	callq	___clang_call_terminate
000000000023ac7f	nop
