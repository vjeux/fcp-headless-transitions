__ZN7PCBlend19isNormalOverNothingE11PCBlendMode:
0000000000018056	pushq	%rbp
0000000000018057	movq	%rsp, %rbp
000000000001805a	pushq	%r15
000000000001805c	pushq	%r14
000000000001805e	pushq	%rbx
000000000001805f	subq	$0x18, %rsp
0000000000018063	cmpl	$0x33, %edi
0000000000018066	ja	0x18114
000000000001806c	movb	$0x1, %al
000000000001806e	movl	%edi, %ecx
0000000000018070	movabsq	$0x1000da0dfdf7d, %rdx          ## imm = 0x1000DA0DFDF7D
000000000001807a	btq	%rcx, %rdx
000000000001807e	jae	0x1808b
0000000000018080	addq	$0x18, %rsp
0000000000018084	popq	%rbx
0000000000018085	popq	%r14
0000000000018087	popq	%r15
0000000000018089	popq	%rbp
000000000001808a	retq
000000000001808b	movl	$0x1e000000, %eax               ## imm = 0x1E000000
0000000000018090	btq	%rcx, %rax
0000000000018094	jae	0x1809a
0000000000018096	xorl	%eax, %eax
0000000000018098	jmp	0x18080
000000000001809a	movabsq	$0xeffc000000000, %rax          ## imm = 0xEFFC000000000
00000000000180a4	btq	%rcx, %rax
00000000000180a8	jae	0x18114
00000000000180aa	movl	$0x40, %edi
00000000000180af	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000180b4	movq	%rax, %rbx
00000000000180b7	leaq	0x1195dd(%rip), %rsi            ## literal pool for: "not implemented yet"
00000000000180be	leaq	-0x20(%rbp), %rdi
00000000000180c2	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000180c7	leaq	0x1195e1(%rip), %rsi            ## literal pool for: "/Library/Caches/com.apple.xbs/Sources/ProCore/ProCore-45000.0.33/PCBlend.cpp"
00000000000180ce	leaq	-0x28(%rbp), %rdi
00000000000180d2	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000180d7	movb	$0x1, %r15b
00000000000180da	leaq	-0x20(%rbp), %rsi
00000000000180de	leaq	-0x28(%rbp), %rdx
00000000000180e2	movq	%rbx, %rdi
00000000000180e5	movl	$0x234, %ecx                    ## imm = 0x234
00000000000180ea	callq	__ZN11PCExceptionC2ERK8PCStringS2_i ## PCException::PCException(PCString const&, PCString const&, int)
00000000000180ef	leaq	0x13115a(%rip), %rax
00000000000180f6	movq	%rax, (%rbx)
00000000000180f9	xorl	%r15d, %r15d
00000000000180fc	leaq	__ZTI31PCUnsupportedOperationException(%rip), %rsi ## typeinfo for PCUnsupportedOperationException
0000000000018103	leaq	__ZN31PCUnsupportedOperationExceptionD1Ev(%rip), %rdx ## PCUnsupportedOperationException::~PCUnsupportedOperationException()
000000000001810a	movq	%rbx, %rdi
000000000001810d	callq	0xde71a                         ## symbol stub for: ___cxa_throw
0000000000018112	ud2
0000000000018114	movl	$0x40, %edi
0000000000018119	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
000000000001811e	movq	%rax, %rbx
0000000000018121	movq	%rax, %rdi
0000000000018124	callq	__ZN26PCIllegalArgumentExceptionC1Ev ## PCIllegalArgumentException::PCIllegalArgumentException()
0000000000018129	movq	%rbx, %rdi
000000000001812c	callq	__ZN7PCBlend13isAssociativeE11PCBlendMode.cold.1 ## PCBlend::isAssociative(PCBlendMode) (.cold.1)
0000000000018131	jmp	0x1815d
0000000000018133	movq	%rax, %r14
0000000000018136	leaq	-0x28(%rbp), %rdi
000000000001813a	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
000000000001813f	leaq	-0x20(%rbp), %rdi
0000000000018143	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000018148	testb	%r15b, %r15b
000000000001814b	jne	0x18160
000000000001814d	jmp	0x18168
000000000001814f	movq	%rax, %r14
0000000000018152	leaq	-0x20(%rbp), %rdi
0000000000018156	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
000000000001815b	jmp	0x18160
000000000001815d	movq	%rax, %r14
0000000000018160	movq	%rbx, %rdi
0000000000018163	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
0000000000018168	movq	%r14, %rdi
000000000001816b	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
