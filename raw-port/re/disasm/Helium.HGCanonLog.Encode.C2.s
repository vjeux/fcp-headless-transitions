__ZN10HGCanonLog6EncodeC2ENS_16SceneColorimetryENS_11LogEncodingENS_14LogColorimetryENS_22CodeValueNormalizationE:
00000000001037a0	pushq	%rbp
00000000001037a1	movq	%rsp, %rbp
00000000001037a4	pushq	%r15
00000000001037a6	pushq	%r14
00000000001037a8	pushq	%r13
00000000001037aa	pushq	%r12
00000000001037ac	pushq	%rbx
00000000001037ad	pushq	%rax
00000000001037ae	movl	%r8d, %r12d
00000000001037b1	movl	%ecx, %r15d
00000000001037b4	movl	%edx, %r13d
00000000001037b7	movl	%esi, -0x2c(%rbp)
00000000001037ba	movq	%rdi, %rbx
00000000001037bd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001037c2	leaq	0x915b37(%rip), %rax
00000000001037c9	movq	%rax, (%rbx)
00000000001037cc	movq	$0x0, 0x198(%rbx)
00000000001037d7	cmpl	$0x2, %r13d
00000000001037db	jne	0x1037f4
00000000001037dd	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001037e2	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001037e7	movq	%rax, %r14
00000000001037ea	movq	%rax, %rdi
00000000001037ed	callq	__ZN19HgcCanonLog3_encodeC1Ev   ## HgcCanonLog3_encode::HgcCanonLog3_encode()
00000000001037f2	jmp	0x103809
00000000001037f4	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001037f9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001037fe	movq	%rax, %r14
0000000000103801	movq	%rax, %rdi
0000000000103804	callq	__ZN18HgcCanonLog_encodeC1Ev    ## HgcCanonLog_encode::HgcCanonLog_encode()
0000000000103809	movq	%r14, 0x1a0(%rbx)
0000000000103810	movq	$0x0, 0x1a8(%rbx)
000000000010381b	movl	%r13d, 0x1b0(%rbx)
0000000000103822	movl	%r12d, 0x1b4(%rbx)
0000000000103829	testl	%r15d, %r15d
000000000010382c	je	0x103863
000000000010382e	cmpl	$0x1, %r15d
0000000000103832	jne	0x103893
0000000000103834	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000103839	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010383e	movq	%rax, %r14
0000000000103841	movq	%rax, %rdi
0000000000103844	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000103849	movq	%r14, 0x198(%rbx)
0000000000103850	movl	-0x2c(%rbp), %ecx
0000000000103853	shlq	$0x6, %rcx
0000000000103857	leaq	__ZN10HGCanonLog6Encode19sourceToCinemaGamutE(%rip), %rax ## HGCanonLog::Encode::sourceToCinemaGamut
000000000010385e	addq	%rcx, %rax
0000000000103861	jmp	0x10388c
0000000000103863	cmpl	$0x1, -0x2c(%rbp)
0000000000103867	jne	0x103893
0000000000103869	movl	$0x1f0, %edi                    ## imm = 0x1F0
000000000010386e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000103873	movq	%rax, %r14
0000000000103876	movq	%rax, %rdi
0000000000103879	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
000000000010387e	movq	%r14, 0x198(%rbx)
0000000000103885	leaq	__ZN12HGColorGamma21rec2020RGBToRec709RGBE(%rip), %rax ## HGColorGamma::rec2020RGBToRec709RGB
000000000010388c	movq	%rax, 0x1a8(%rbx)
0000000000103893	addq	$0x8, %rsp
0000000000103897	popq	%rbx
0000000000103898	popq	%r12
000000000010389a	popq	%r13
000000000010389c	popq	%r14
000000000010389e	popq	%r15
00000000001038a0	popq	%rbp
00000000001038a1	retq
00000000001038a2	jmp	0x1038a8
00000000001038a4	jmp	0x1038a8
00000000001038a6	jmp	0x1038a8
00000000001038a8	movq	%rax, %r15
00000000001038ab	movq	%r14, %rdi
00000000001038ae	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001038b3	movq	%rbx, %rdi
00000000001038b6	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001038bb	movq	%r15, %rdi
00000000001038be	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001038c3	movq	%rax, %r15
00000000001038c6	movq	%rbx, %rdi
00000000001038c9	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001038ce	movq	%r15, %rdi
00000000001038d1	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001038d6	nopw	%cs:(%rax,%rax)
