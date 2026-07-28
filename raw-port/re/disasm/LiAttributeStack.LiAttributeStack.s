__ZN16LiAttributeStackC2Ei:
000000000023a9c0	pushq	%rbp
000000000023a9c1	movq	%rsp, %rbp
000000000023a9c4	pushq	%r15
000000000023a9c6	pushq	%r14
000000000023a9c8	pushq	%r12
000000000023a9ca	pushq	%rbx
000000000023a9cb	subq	$0x10, %rsp
000000000023a9cf	movl	%esi, %r15d
000000000023a9d2	movq	%rdi, %r14
000000000023a9d5	movl	$0x0, (%rdi)
000000000023a9db	movb	$0x0, 0x4(%rdi)
000000000023a9df	leaq	0x8(%rdi), %rbx
000000000023a9e3	movq	%rbx, %rdi
000000000023a9e6	callq	0x6de9ac                        ## symbol stub for: __ZN5ProGL2GLC1Ev
000000000023a9eb	testl	%r15d, %r15d
000000000023a9ee	je	0x23aa9c
000000000023a9f4	movq	(%rbx), %rax
000000000023a9f7	movq	(%rax), %rdi
000000000023a9fa	movl	%r15d, %esi
000000000023a9fd	callq	*0x688(%rax)
000000000023aa03	cmpb	$0x1, 0x4(%r14)
000000000023aa08	jne	0x23aa99
000000000023aa0e	movq	0x5eb80b(%rip), %rdi            ## literal pool symbol address: __ZNSt3__14cerrE
000000000023aa15	leaq	0x595d0a(%rip), %rsi            ## literal pool for: "gl.pushAttrib("
000000000023aa1c	movl	$0xe, %edx
000000000023aa21	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000023aa26	movq	%rax, %rdi
000000000023aa29	movl	%r15d, %esi
000000000023aa2c	callq	0x6dfb94                        ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEi
000000000023aa31	leaq	0x58d423(%rip), %rsi            ## literal pool for: ")"
000000000023aa38	movl	$0x1, %edx
000000000023aa3d	movq	%rax, %rdi
000000000023aa40	callq	__ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEERNS_13basic_ostreamIT_T0_EES7_PKS4_m ## std::__1::basic_ostream<char, std::__1::char_traits<char>>& std::__1::__put_character_sequence[abi:nqe210106]<char, std::__1::char_traits<char>>(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, char const*, unsigned long)
000000000023aa45	movq	%rax, %r15
000000000023aa48	movq	(%rax), %rax
000000000023aa4b	movq	-0x18(%rax), %rsi
000000000023aa4f	addq	%r15, %rsi
000000000023aa52	leaq	-0x28(%rbp), %rdi
000000000023aa56	callq	0x6dfb16                        ## symbol stub for: __ZNKSt3__18ios_base6getlocEv
000000000023aa5b	movq	0x5eb7ce(%rip), %rsi            ## literal pool symbol address: __ZNSt3__15ctypeIcE2idE
000000000023aa62	leaq	-0x28(%rbp), %rdi
000000000023aa66	callq	0x6dfb10                        ## symbol stub for: __ZNKSt3__16locale9use_facetERNS0_2idE
000000000023aa6b	movq	(%rax), %rcx
000000000023aa6e	movq	%rax, %rdi
000000000023aa71	movl	$0xa, %esi
000000000023aa76	callq	*0x38(%rcx)
000000000023aa79	movl	%eax, %r12d
000000000023aa7c	leaq	-0x28(%rbp), %rdi
000000000023aa80	callq	0x6dfbf4                        ## symbol stub for: __ZNSt3__16localeD1Ev
000000000023aa85	movsbl	%r12b, %esi
000000000023aa89	movq	%r15, %rdi
000000000023aa8c	callq	0x6dfb64                        ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc
000000000023aa91	movq	%r15, %rdi
000000000023aa94	callq	0x6dfb6a                        ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv
000000000023aa99	incl	(%r14)
000000000023aa9c	addq	$0x10, %rsp
000000000023aaa0	popq	%rbx
000000000023aaa1	popq	%r12
000000000023aaa3	popq	%r14
000000000023aaa5	popq	%r15
000000000023aaa7	popq	%rbp
000000000023aaa8	retq
000000000023aaa9	movq	%rax, %r14
000000000023aaac	leaq	-0x28(%rbp), %rdi
000000000023aab0	callq	0x6dfbf4                        ## symbol stub for: __ZNSt3__16localeD1Ev
000000000023aab5	movq	%rbx, %rdi
000000000023aab8	callq	0x6de9b2                        ## symbol stub for: __ZN5ProGL2GLD1Ev
000000000023aabd	movq	%r14, %rdi
000000000023aac0	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000023aac5	movq	%rax, %r14
000000000023aac8	movq	%rbx, %rdi
000000000023aacb	callq	0x6de9b2                        ## symbol stub for: __ZN5ProGL2GLD1Ev
000000000023aad0	movq	%r14, %rdi
000000000023aad3	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000023aad8	nopl	(%rax,%rax)
