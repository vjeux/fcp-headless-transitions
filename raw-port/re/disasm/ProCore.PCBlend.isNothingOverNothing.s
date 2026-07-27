__ZN7PCBlend20isNothingOverNothingE11PCBlendMode:
0000000000018170	pushq	%rbp
0000000000018171	movq	%rsp, %rbp
0000000000018174	pushq	%r15
0000000000018176	pushq	%r14
0000000000018178	pushq	%rbx
0000000000018179	subq	$0x18, %rsp
000000000001817d	cmpl	$0x33, %edi
0000000000018180	ja	0x1822e
0000000000018186	movl	%edi, %eax
0000000000018188	movabsq	$0x1000da0dfdf7d, %rcx          ## imm = 0x1000DA0DFDF7D
0000000000018192	btq	%rax, %rcx
0000000000018196	jae	0x181a5
0000000000018198	xorl	%eax, %eax
000000000001819a	addq	$0x18, %rsp
000000000001819e	popq	%rbx
000000000001819f	popq	%r14
00000000000181a1	popq	%r15
00000000000181a3	popq	%rbp
00000000000181a4	retq
00000000000181a5	movl	$0x1e000000, %ecx               ## imm = 0x1E000000
00000000000181aa	btq	%rax, %rcx
00000000000181ae	jae	0x181b4
00000000000181b0	movb	$0x1, %al
00000000000181b2	jmp	0x1819a
00000000000181b4	movabsq	$0xeffc000000000, %rcx          ## imm = 0xEFFC000000000
00000000000181be	btq	%rax, %rcx
00000000000181c2	jae	0x1822e
00000000000181c4	movl	$0x40, %edi
00000000000181c9	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000181ce	movq	%rax, %rbx
00000000000181d1	leaq	0x1194c3(%rip), %rsi            ## literal pool for: "not implemented yet"
00000000000181d8	leaq	-0x20(%rbp), %rdi
00000000000181dc	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000181e1	leaq	0x1194c7(%rip), %rsi            ## literal pool for: "/Library/Caches/com.apple.xbs/Sources/ProCore/ProCore-45000.0.33/PCBlend.cpp"
00000000000181e8	leaq	-0x28(%rbp), %rdi
00000000000181ec	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000181f1	movb	$0x1, %r15b
00000000000181f4	leaq	-0x20(%rbp), %rsi
00000000000181f8	leaq	-0x28(%rbp), %rdx
00000000000181fc	movq	%rbx, %rdi
00000000000181ff	movl	$0x278, %ecx                    ## imm = 0x278
0000000000018204	callq	__ZN11PCExceptionC2ERK8PCStringS2_i ## PCException::PCException(PCString const&, PCString const&, int)
0000000000018209	leaq	0x131040(%rip), %rax
0000000000018210	movq	%rax, (%rbx)
0000000000018213	xorl	%r15d, %r15d
0000000000018216	leaq	__ZTI31PCUnsupportedOperationException(%rip), %rsi ## typeinfo for PCUnsupportedOperationException
000000000001821d	leaq	__ZN31PCUnsupportedOperationExceptionD1Ev(%rip), %rdx ## PCUnsupportedOperationException::~PCUnsupportedOperationException()
0000000000018224	movq	%rbx, %rdi
0000000000018227	callq	0xde71a                         ## symbol stub for: ___cxa_throw
000000000001822c	ud2
000000000001822e	movl	$0x40, %edi
0000000000018233	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
0000000000018238	movq	%rax, %rbx
000000000001823b	movq	%rax, %rdi
000000000001823e	callq	__ZN26PCIllegalArgumentExceptionC1Ev ## PCIllegalArgumentException::PCIllegalArgumentException()
0000000000018243	movq	%rbx, %rdi
0000000000018246	callq	__ZN7PCBlend13isAssociativeE11PCBlendMode.cold.1 ## PCBlend::isAssociative(PCBlendMode) (.cold.1)
000000000001824b	jmp	0x18277
000000000001824d	movq	%rax, %r14
0000000000018250	leaq	-0x28(%rbp), %rdi
0000000000018254	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000018259	leaq	-0x20(%rbp), %rdi
000000000001825d	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000018262	testb	%r15b, %r15b
0000000000018265	jne	0x1827a
0000000000018267	jmp	0x18282
0000000000018269	movq	%rax, %r14
000000000001826c	leaq	-0x20(%rbp), %rdi
0000000000018270	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000018275	jmp	0x1827a
0000000000018277	movq	%rax, %r14
000000000001827a	movq	%rbx, %rdi
000000000001827d	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
0000000000018282	movq	%r14, %rdi
0000000000018285	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
