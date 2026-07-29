__Z27PCGetTransferFunctionString23PCTransferFunctionValue:
00000000000c1736	pushq	%rbp
00000000000c1737	movq	%rsp, %rbp
00000000000c173a	xorl	%eax, %eax
00000000000c173c	decl	%edi
00000000000c173e	cmpl	$0x11, %edi
00000000000c1741	ja	0xc17a5
00000000000c1743	leaq	0x5e(%rip), %rcx
00000000000c174a	movslq	(%rcx,%rdi,4), %rdx
00000000000c174e	addq	%rcx, %rdx
00000000000c1751	jmpq	*%rdx
00000000000c1753	movq	0x861be(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_ITU_R_709_2
00000000000c175a	jmp	0xc17a2
00000000000c175c	movq	0x861c5(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_SMPTE_240M_1995
00000000000c1763	jmp	0xc17a2
00000000000c1765	movq	0x8619c(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_ITU_R_2020
00000000000c176c	jmp	0xc17a2
00000000000c176e	movq	0x861cb(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_UseGamma
00000000000c1775	jmp	0xc17a2
00000000000c1777	movq	0x861b2(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_SMPTE_ST_2084_PQ
00000000000c177e	jmp	0xc17a2
00000000000c1780	movq	0x861b1(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_SMPTE_ST_428_1
00000000000c1787	jmp	0xc17a2
00000000000c1789	movq	0x86190(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_Linear
00000000000c1790	jmp	0xc17a2
00000000000c1792	movq	0x861af(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_sRGB
00000000000c1799	jmp	0xc17a2
00000000000c179b	movq	0x8616e(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_ITU_R_2100_HLG
00000000000c17a2	movq	(%rax), %rax
00000000000c17a5	popq	%rbp
00000000000c17a6	retq
00000000000c17a7	nop
00000000000c17a8	stosl	%eax, %es:(%rdi)
00000000000c17a9	.byte 0xff #bad opcode
00000000000c17aa	.byte 0xff #bad opcode
00000000000c17ab	incl	%esi
00000000000c17ad	.byte 0xff #bad opcode
00000000000c17ae	.byte 0xff #bad opcode
00000000000c17af	.byte 0xff #bad opcode
00000000000c17b0	std
00000000000c17b1	.byte 0xff #bad opcode
00000000000c17b2	.byte 0xff #bad opcode
00000000000c17b3	.byte 0xff #bad opcode
00000000000c17b4	std
00000000000c17b5	.byte 0xff #bad opcode
00000000000c17b6	.byte 0xff #bad opcode
00000000000c17b7	.byte 0xff #bad opcode
00000000000c17b8	std
00000000000c17b9	.byte 0xff #bad opcode
00000000000c17ba	.byte 0xff #bad opcode
00000000000c17bb	.byte 0xff #bad opcode
00000000000c17bc	std
00000000000c17bd	.byte 0xff #bad opcode
00000000000c17be	.byte 0xff #bad opcode
00000000000c17bf	pushq	-0x1e0001(%rdi,%rdi,8)
00000000000c17c6	.byte 0xff #bad opcode
00000000000c17c7	.byte 0xff #bad opcode
00000000000c17c8	std
00000000000c17c9	.byte 0xff #bad opcode
00000000000c17ca	.byte 0xff #bad opcode
00000000000c17cb	.byte 0xff #bad opcode
00000000000c17cc	std
00000000000c17cd	.byte 0xff #bad opcode
00000000000c17ce	.byte 0xff #bad opcode
00000000000c17cf	.byte 0xff #bad opcode
00000000000c17d0	std
00000000000c17d1	.byte 0xff #bad opcode
00000000000c17d2	.byte 0xff #bad opcode
00000000000c17d3	.byte 0xff #bad opcode
00000000000c17d4	std
00000000000c17d5	.byte 0xff #bad opcode
00000000000c17d6	.byte 0xff #bad opcode
00000000000c17d7	.byte 0xff #bad opcode
00000000000c17d8	.byte 0xea #bad opcode
00000000000c17d9	.byte 0xff #bad opcode
00000000000c17da	.byte 0xff #bad opcode
00000000000c17db	.byte 0xff #bad opcode
00000000000c17dc	movl	$0xfdffffff, %ebp               ## imm = 0xFDFFFFFF
00000000000c17e1	.byte 0xff #bad opcode
00000000000c17e2	.byte 0xff #bad opcode
00000000000c17e3	decl	%edi
00000000000c17e5	.byte 0xff #bad opcode
00000000000c17e6	.byte 0xff #bad opcode
00000000000c17e7	.byte 0xff #bad opcode
00000000000c17e8	fdivr	%st(7), %st
00000000000c17ea	.byte 0xff #bad opcode
00000000000c17eb	pushq	%rbx
00000000000c17ed	.byte 0xff #bad opcode
00000000000c17ee	.byte 0xff #bad opcode
00000000000c17ef	decl	-0x7b(%rax)
00000000000c17f2	pushq	0x55(%rdi,%rsi,2)
00000000000c17f6	movq	%rsp, %rbp
00000000000c17f9	pushq	%r14
00000000000c17fb	pushq	%rbx
00000000000c17fc	movl	%esi, %r14d
00000000000c17ff	movq	%rdi, %rbx
00000000000c1802	movq	0x8610f(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_ITU_R_709_2
00000000000c1809	movq	(%rax), %rsi
00000000000c180c	callq	0xddfca                         ## symbol stub for: _CFEqual
00000000000c1811	movl	%eax, %ecx
00000000000c1813	movl	$0x1, %eax
00000000000c1818	testb	%cl, %cl
00000000000c181a	jne	0xc1907
00000000000c1820	movq	0x86101(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_SMPTE_240M_1995
00000000000c1827	movq	(%rax), %rsi
00000000000c182a	movq	%rbx, %rdi
00000000000c182d	callq	0xddfca                         ## symbol stub for: _CFEqual
00000000000c1832	movl	%eax, %ecx
00000000000c1834	movl	$0x7, %eax
00000000000c1839	testb	%cl, %cl
00000000000c183b	jne	0xc1907
00000000000c1841	movq	0x860c0(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_ITU_R_2020
00000000000c1848	movq	(%rax), %rsi
00000000000c184b	movq	%rbx, %rdi
00000000000c184e	callq	0xddfca                         ## symbol stub for: _CFEqual
00000000000c1853	testb	%al, %al
00000000000c1855	je	0xc1872
00000000000c1857	testb	%r14b, %r14b
00000000000c185a	movl	$0x1, %ecx
00000000000c185f	movl	$0xe, %eax
00000000000c1864	cmovnel	%ecx, %eax
00000000000c1867	jmp	0xc1907
00000000000c186c	movl	$0x2, %eax
00000000000c1871	retq
00000000000c1872	movq	0x860b7(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_SMPTE_ST_2084_PQ
00000000000c1879	movq	(%rax), %rsi
00000000000c187c	movq	%rbx, %rdi
00000000000c187f	callq	0xddfca                         ## symbol stub for: _CFEqual
00000000000c1884	movl	%eax, %ecx
00000000000c1886	movl	$0x10, %eax
00000000000c188b	testb	%cl, %cl
00000000000c188d	jne	0xc1907
00000000000c188f	movq	0x860a2(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_SMPTE_ST_428_1
00000000000c1896	movq	(%rax), %rsi
00000000000c1899	movq	%rbx, %rdi
00000000000c189c	callq	0xddfca                         ## symbol stub for: _CFEqual
00000000000c18a1	movl	%eax, %ecx
00000000000c18a3	movl	$0x11, %eax
00000000000c18a8	testb	%cl, %cl
00000000000c18aa	jne	0xc1907
00000000000c18ac	movq	0x8605d(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_ITU_R_2100_HLG
00000000000c18b3	movq	(%rax), %rsi
00000000000c18b6	movq	%rbx, %rdi
00000000000c18b9	callq	0xddfca                         ## symbol stub for: _CFEqual
00000000000c18be	movl	%eax, %ecx
00000000000c18c0	movl	$0x12, %eax
00000000000c18c5	testb	%cl, %cl
00000000000c18c7	jne	0xc1907
00000000000c18c9	movq	0x86050(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_Linear
00000000000c18d0	movq	(%rax), %rsi
00000000000c18d3	movq	%rbx, %rdi
00000000000c18d6	callq	0xddfca                         ## symbol stub for: _CFEqual
00000000000c18db	movl	%eax, %ecx
00000000000c18dd	movl	$0x8, %eax
00000000000c18e2	testb	%cl, %cl
00000000000c18e4	jne	0xc1907
00000000000c18e6	movq	0x8605b(%rip), %rax             ## literal pool symbol address: _kCVImageBufferTransferFunction_sRGB
00000000000c18ed	movq	(%rax), %rsi
00000000000c18f0	movq	%rbx, %rdi
00000000000c18f3	callq	0xddfca                         ## symbol stub for: _CFEqual
00000000000c18f8	testb	%al, %al
00000000000c18fa	movl	$0x2, %ecx
00000000000c18ff	movl	$0xd, %eax
00000000000c1904	cmovel	%ecx, %eax
00000000000c1907	popq	%rbx
00000000000c1908	popq	%r14
00000000000c190a	popq	%rbp
00000000000c190b	retq
