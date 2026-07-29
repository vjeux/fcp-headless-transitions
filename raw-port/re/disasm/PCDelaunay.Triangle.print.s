__ZN10PCDelaunay8Triangle5printEv:
0000000000054802	pushq	%rbp
0000000000054803	movq	%rsp, %rbp
0000000000054806	pushq	%r14
0000000000054808	pushq	%rbx
0000000000054809	subq	$0x10, %rsp
000000000005480d	movq	%rdi, %rsi
0000000000054810	movq	0xf3809(%rip), %rbx             ## literal pool symbol address: __ZNSt3__14cerrE
0000000000054817	movq	%rbx, %rdi
000000000005481a	callq	__ZlsRNSt3__113basic_ostreamIcNS_11char_traitsIcEEEERN10PCDelaunay8TriangleE ## operator<<(std::__1::basic_ostream<char, std::__1::char_traits<char>>&, PCDelaunay::Triangle&)
000000000005481f	movq	(%rbx), %rax
0000000000054822	addq	-0x18(%rax), %rbx
0000000000054826	leaq	-0x18(%rbp), %r14
000000000005482a	movq	%r14, %rdi
000000000005482d	movq	%rbx, %rsi
0000000000054830	callq	0xde534                         ## symbol stub for: __ZNKSt3__18ios_base6getlocEv
0000000000054835	movq	0xf37f4(%rip), %rsi             ## literal pool symbol address: __ZNSt3__15ctypeIcE2idE
000000000005483c	movq	%r14, %rdi
000000000005483f	callq	0xde52e                         ## symbol stub for: __ZNKSt3__16locale9use_facetERNS0_2idE
0000000000054844	movq	(%rax), %rcx
0000000000054847	movq	%rax, %rdi
000000000005484a	movl	$0xa, %esi
000000000005484f	callq	*0x38(%rcx)
0000000000054852	movl	%eax, %ebx
0000000000054854	leaq	-0x18(%rbp), %rdi
0000000000054858	callq	0xde678                         ## symbol stub for: __ZNSt3__16localeD1Ev
000000000005485d	movsbl	%bl, %esi
0000000000054860	movq	0xf37b9(%rip), %rbx             ## literal pool symbol address: __ZNSt3__14cerrE
0000000000054867	movq	%rbx, %rdi
000000000005486a	callq	0xde5c4                         ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc
000000000005486f	movq	%rbx, %rdi
0000000000054872	callq	0xde5ca                         ## symbol stub for: __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv
0000000000054877	addq	$0x10, %rsp
000000000005487b	popq	%rbx
000000000005487c	popq	%r14
000000000005487e	popq	%rbp
000000000005487f	retq
0000000000054880	movq	%rax, %rbx
0000000000054883	leaq	-0x18(%rbp), %rdi
0000000000054887	callq	0xde678                         ## symbol stub for: __ZNSt3__16localeD1Ev
000000000005488c	movq	%rbx, %rdi
000000000005488f	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
