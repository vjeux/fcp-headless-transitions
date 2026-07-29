__ZN11HGSonySLog26EncodeC2ENS_16SceneColorimetryEj:
0000000000104740	pushq	%rbp
0000000000104741	movq	%rsp, %rbp
0000000000104744	pushq	%r15
0000000000104746	pushq	%r14
0000000000104748	pushq	%r12
000000000010474a	pushq	%rbx
000000000010474b	movl	%edx, %r14d
000000000010474e	movl	%esi, %r15d
0000000000104751	movq	%rdi, %rbx
0000000000104754	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000104759	leaq	0x9156e0(%rip), %rax
0000000000104760	movq	%rax, (%rbx)
0000000000104763	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000104768	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000010476d	movq	%rax, %r12
0000000000104770	movq	%rax, %rdi
0000000000104773	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000104778	movq	%r12, 0x198(%rbx)
000000000010477f	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000104784	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000104789	movq	%rax, %r12
000000000010478c	movq	%rax, %rdi
000000000010478f	callq	__ZN18HgcLogVideo_encodeC1Ev    ## HgcLogVideo_encode::HgcLogVideo_encode()
0000000000104794	movl	%r15d, %eax
0000000000104797	shlq	$0x6, %rax
000000000010479b	cmpl	$0x1388, %r14d                  ## imm = 0x1388
00000000001047a2	leaq	__ZN11HGSonySLog26Encode22sourceToSGamutTungstenE(%rip), %rcx ## HGSonySLog2::Encode::sourceToSGamutTungsten
00000000001047a9	leaq	__ZN11HGSonySLog26Encode22sourceToSGamutDaylightE(%rip), %rdx ## HGSonySLog2::Encode::sourceToSGamutDaylight
00000000001047b0	cmovbq	%rcx, %rdx
00000000001047b4	movq	%r12, 0x1a0(%rbx)
00000000001047bb	addq	%rax, %rdx
00000000001047be	movq	%rdx, 0x1a8(%rbx)
00000000001047c5	movl	$0x3cf5c520, 0x1b0(%rbx)        ## imm = 0x3CF5C520
00000000001047cf	popq	%rbx
00000000001047d0	popq	%r12
00000000001047d2	popq	%r14
00000000001047d4	popq	%r15
00000000001047d6	popq	%rbp
00000000001047d7	retq
00000000001047d8	jmp	0x1047da
00000000001047da	movq	%rax, %r14
00000000001047dd	movq	%r12, %rdi
00000000001047e0	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001047e5	movq	%rbx, %rdi
00000000001047e8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001047ed	movq	%r14, %rdi
00000000001047f0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001047f5	movq	%rax, %r14
00000000001047f8	movq	%rbx, %rdi
00000000001047fb	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104800	movq	%r14, %rdi
0000000000104803	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000104808	nopl	(%rax,%rax)

__ZN11HGSonySLog26EncodeC1ENS_16SceneColorimetryEj:
0000000000104810	pushq	%rbp
0000000000104811	movq	%rsp, %rbp
0000000000104814	popq	%rbp
0000000000104815	jmp	__ZN11HGSonySLog26EncodeC2ENS_16SceneColorimetryEj ## HGSonySLog2::Encode::Encode(HGSonySLog2::SceneColorimetry, unsigned int)
000000000010481a	nopw	(%rax,%rax)

__ZN11HGSonySLog26EncodeD2Ev:
0000000000104820	pushq	%rbp
0000000000104821	movq	%rsp, %rbp
0000000000104824	pushq	%rbx
0000000000104825	pushq	%rax
0000000000104826	movq	%rdi, %rbx
0000000000104829	leaq	0x915610(%rip), %rax
0000000000104830	movq	%rax, (%rdi)
0000000000104833	movq	0x198(%rdi), %rdi
000000000010483a	testq	%rdi, %rdi
000000000010483d	je	0x104845
000000000010483f	movq	(%rdi), %rax
0000000000104842	callq	*0x18(%rax)
0000000000104845	movq	0x1a0(%rbx), %rdi
000000000010484c	testq	%rdi, %rdi
000000000010484f	je	0x104857
0000000000104851	movq	(%rdi), %rax
0000000000104854	callq	*0x18(%rax)
0000000000104857	movq	%rbx, %rdi
000000000010485a	addq	$0x8, %rsp
000000000010485e	popq	%rbx
000000000010485f	popq	%rbp
0000000000104860	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000104865	movq	%rax, %rdi
0000000000104868	callq	___clang_call_terminate
000000000010486d	nopl	(%rax)

__ZN11HGSonySLog26EncodeD1Ev:
0000000000104870	pushq	%rbp
0000000000104871	movq	%rsp, %rbp
0000000000104874	pushq	%rbx
0000000000104875	pushq	%rax
0000000000104876	movq	%rdi, %rbx
0000000000104879	leaq	0x9155c0(%rip), %rax
0000000000104880	movq	%rax, (%rdi)
0000000000104883	movq	0x198(%rdi), %rdi
000000000010488a	testq	%rdi, %rdi
000000000010488d	je	0x104895
000000000010488f	movq	(%rdi), %rax
0000000000104892	callq	*0x18(%rax)
0000000000104895	movq	0x1a0(%rbx), %rdi
000000000010489c	testq	%rdi, %rdi
000000000010489f	je	0x1048a7
00000000001048a1	movq	(%rdi), %rax
00000000001048a4	callq	*0x18(%rax)
00000000001048a7	movq	%rbx, %rdi
00000000001048aa	addq	$0x8, %rsp
00000000001048ae	popq	%rbx
00000000001048af	popq	%rbp
00000000001048b0	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001048b5	movq	%rax, %rdi
00000000001048b8	callq	___clang_call_terminate
00000000001048bd	nopl	(%rax)

__ZN11HGSonySLog26EncodeD0Ev:
00000000001048c0	pushq	%rbp
00000000001048c1	movq	%rsp, %rbp
00000000001048c4	pushq	%rbx
00000000001048c5	pushq	%rax
00000000001048c6	movq	%rdi, %rbx
00000000001048c9	leaq	0x915570(%rip), %rax
00000000001048d0	movq	%rax, (%rdi)
00000000001048d3	movq	0x198(%rdi), %rdi
00000000001048da	testq	%rdi, %rdi
00000000001048dd	je	0x1048e5
00000000001048df	movq	(%rdi), %rax
00000000001048e2	callq	*0x18(%rax)
00000000001048e5	movq	0x1a0(%rbx), %rdi
00000000001048ec	testq	%rdi, %rdi
00000000001048ef	je	0x1048f7
00000000001048f1	movq	(%rdi), %rax
00000000001048f4	callq	*0x18(%rax)
00000000001048f7	movq	%rbx, %rdi
00000000001048fa	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001048ff	movq	%rbx, %rdi
0000000000104902	addq	$0x8, %rsp
0000000000104906	popq	%rbx
0000000000104907	popq	%rbp
0000000000104908	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010490d	movq	%rax, %rdi
0000000000104910	callq	___clang_call_terminate
0000000000104915	nopw	%cs:(%rax,%rax)

__ZN11HGSonySLog26Encode9GetOutputEP10HGRenderer:
0000000000104920	pushq	%rbp
0000000000104921	movq	%rsp, %rbp
0000000000104924	pushq	%r14
0000000000104926	pushq	%rbx
0000000000104927	movq	%rdi, %rbx
000000000010492a	movq	0x198(%rdi), %r14
0000000000104931	movq	%rsi, %rdi
0000000000104934	movq	%rbx, %rsi
0000000000104937	xorl	%edx, %edx
0000000000104939	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000010493e	movq	(%r14), %rcx
0000000000104941	movq	%r14, %rdi
0000000000104944	xorl	%esi, %esi
0000000000104946	movq	%rax, %rdx
0000000000104949	callq	*0x78(%rcx)
000000000010494c	movq	0x198(%rbx), %rdi
0000000000104953	movq	0x1a8(%rbx), %rsi
000000000010495a	movl	$0x1, %edx
000000000010495f	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000104964	movq	0x198(%rbx), %rdx
000000000010496b	movq	0x1a0(%rbx), %rdi
0000000000104972	movq	(%rdi), %rax
0000000000104975	xorl	%esi, %esi
0000000000104977	callq	*0x78(%rax)
000000000010497a	movq	0x1a0(%rbx), %rdi
0000000000104981	movq	(%rdi), %rax
0000000000104984	movss	0x2cc6c4(%rip), %xmm0
000000000010498c	movss	0x2cc6c0(%rip), %xmm1
0000000000104994	movss	0x2cc6bc(%rip), %xmm2
000000000010499c	movss	0x2cc6b8(%rip), %xmm3
00000000001049a4	xorl	%esi, %esi
00000000001049a6	callq	*0x60(%rax)
00000000001049a9	movq	0x1a0(%rbx), %rdi
00000000001049b0	movss	0x1b0(%rbx), %xmm1
00000000001049b8	movq	(%rdi), %rax
00000000001049bb	movss	0x2cc69d(%rip), %xmm0
00000000001049c3	xorps	%xmm2, %xmm2
00000000001049c6	xorps	%xmm3, %xmm3
00000000001049c9	movl	$0x1, %esi
00000000001049ce	callq	*0x60(%rax)
00000000001049d1	movq	0x1a0(%rbx), %rax
00000000001049d8	popq	%rbx
00000000001049d9	popq	%r14
00000000001049db	popq	%rbp
00000000001049dc	retq
00000000001049dd	nopl	(%rax)
