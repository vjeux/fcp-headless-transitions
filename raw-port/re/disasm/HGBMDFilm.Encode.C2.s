__ZN9HGBMDFilm6EncodeC2ENS_16SceneColorimetryENS_11LogEncodingE:
0000000000103210	pushq	%rbp
0000000000103211	movq	%rsp, %rbp
0000000000103214	pushq	%r15
0000000000103216	pushq	%r14
0000000000103218	pushq	%r12
000000000010321a	pushq	%rbx
000000000010321b	movl	%edx, %r14d
000000000010321e	movl	%esi, %r15d
0000000000103221	movq	%rdi, %rbx
0000000000103224	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000103229	leaq	0x915c50(%rip), %rax
0000000000103230	movq	%rax, (%rbx)
0000000000103233	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000103238	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010323d	movq	%rax, %r12
0000000000103240	movq	%rax, %rdi
0000000000103243	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000103248	movq	%r12, 0x198(%rbx)
000000000010324f	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000103254	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000103259	movq	%rax, %r12
000000000010325c	movq	%rax, %rdi
000000000010325f	callq	__ZN18HgcLogVideo_encodeC1Ev    ## HgcLogVideo_encode::HgcLogVideo_encode()
0000000000103264	movl	%r15d, %eax
0000000000103267	shlq	$0x6, %rax
000000000010326b	testl	%r14d, %r14d
000000000010326e	leaq	__ZN9HGBMDFilm6Encode18sourceToBMDFilmRGBE(%rip), %rcx ## HGBMDFilm::Encode::sourceToBMDFilmRGB
0000000000103275	leaq	__ZN9HGBMDFilm6Encode20sourceToBMDFilm4KRGBE(%rip), %rdx ## HGBMDFilm::Encode::sourceToBMDFilm4KRGB
000000000010327c	cmoveq	%rcx, %rdx
0000000000103280	movq	%r12, 0x1a0(%rbx)
0000000000103287	addq	%rax, %rdx
000000000010328a	movq	%rdx, 0x1a8(%rbx)
0000000000103291	movl	%r14d, 0x1b0(%rbx)
0000000000103298	popq	%rbx
0000000000103299	popq	%r12
000000000010329b	popq	%r14
000000000010329d	popq	%r15
000000000010329f	popq	%rbp
00000000001032a0	retq
00000000001032a1	jmp	0x1032a3
00000000001032a3	movq	%rax, %r14
00000000001032a6	movq	%r12, %rdi
00000000001032a9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001032ae	movq	%rbx, %rdi
00000000001032b1	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001032b6	movq	%r14, %rdi
00000000001032b9	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001032be	movq	%rax, %r14
00000000001032c1	movq	%rbx, %rdi
00000000001032c4	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001032c9	movq	%r14, %rdi
00000000001032cc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001032d1	nopw	%cs:(%rax,%rax)
