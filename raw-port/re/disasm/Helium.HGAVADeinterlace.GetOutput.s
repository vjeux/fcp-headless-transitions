__ZN16HGAVADeinterlace9GetOutputEP10HGRenderer:
0000000000221490	pushq	%rbp
0000000000221491	movq	%rsp, %rbp
0000000000221494	pushq	%r15
0000000000221496	pushq	%r14
0000000000221498	pushq	%r13
000000000022149a	pushq	%r12
000000000022149c	pushq	%rbx
000000000022149d	subq	$0x38, %rsp
00000000002214a1	movq	%rsi, %r13
00000000002214a4	movq	%rdi, %r15
00000000002214a7	movq	%rsi, %rdi
00000000002214aa	movq	%r15, %rsi
00000000002214ad	xorl	%edx, %edx
00000000002214af	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000002214b4	movq	%rax, -0x30(%rbp)
00000000002214b8	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000002214bd	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000002214c2	movq	%rax, %rbx
00000000002214c5	movq	%rax, %rdi
00000000002214c8	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000002214cd	leaq	0x80f194(%rip), %rax
00000000002214d4	movq	%rax, (%rbx)
00000000002214d7	movl	$0x127, %edi                    ## imm = 0x127
00000000002214dc	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000002214e1	leaq	0x8(%rax), %rcx
00000000002214e5	negl	%ecx
00000000002214e7	andl	$0x1f, %ecx
00000000002214ea	leaq	(%rcx,%rax), %rdx
00000000002214ee	addq	$0x8, %rdx
00000000002214f2	movq	%rax, (%rcx,%rax)
00000000002214f6	xorps	%xmm0, %xmm0
00000000002214f9	movaps	%xmm0, 0x8(%rcx,%rax)
00000000002214fe	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000221503	movaps	0x1a6726(%rip), %xmm0
000000000022150a	movaps	%xmm0, 0x38(%rcx,%rax)
000000000022150f	movaps	%xmm0, 0x28(%rcx,%rax)
0000000000221514	movaps	0x66b2d5(%rip), %xmm0
000000000022151b	movaps	%xmm0, 0x58(%rcx,%rax)
0000000000221520	movaps	%xmm0, 0x48(%rcx,%rax)
0000000000221525	movsd	0x66b2d3(%rip), %xmm0
000000000022152d	movaps	%xmm0, 0x78(%rcx,%rax)
0000000000221532	movaps	%xmm0, 0x68(%rcx,%rax)
0000000000221537	movsd	0x1a9541(%rip), %xmm0
000000000022153f	movaps	%xmm0, 0x98(%rcx,%rax)
0000000000221547	movaps	%xmm0, 0x88(%rcx,%rax)
000000000022154f	movaps	0x1a8a8a(%rip), %xmm0
0000000000221556	movaps	%xmm0, 0xb8(%rcx,%rax)
000000000022155e	movaps	%xmm0, 0xa8(%rcx,%rax)
0000000000221566	movaps	0x1a66d3(%rip), %xmm0
000000000022156d	movaps	%xmm0, 0xd8(%rcx,%rax)
0000000000221575	movaps	%xmm0, 0xc8(%rcx,%rax)
000000000022157d	movaps	0x63e6bc(%rip), %xmm0
0000000000221584	movaps	%xmm0, 0xf8(%rcx,%rax)
000000000022158c	movaps	%xmm0, 0xe8(%rcx,%rax)
0000000000221594	movq	%rdx, 0x198(%rbx)
000000000022159b	movq	(%rbx), %rax
000000000022159e	movq	%rbx, %rdi
00000000002215a1	xorl	%esi, %esi
00000000002215a3	movl	$0x1, %edx
00000000002215a8	callq	*0x88(%rax)
00000000002215ae	movl	$0xfffff9fe, %eax               ## imm = 0xFFFFF9FE
00000000002215b3	andl	0x10(%rbx), %eax
00000000002215b6	orl	$0x401, %eax                    ## imm = 0x401
00000000002215bb	movl	%eax, 0x10(%rbx)
00000000002215be	movq	(%rbx), %rax
00000000002215c1	movq	%rbx, %rdi
00000000002215c4	xorl	%esi, %esi
00000000002215c6	movq	-0x30(%rbp), %rdx
00000000002215ca	callq	*0x78(%rax)
00000000002215cd	cmpl	$0x0, 0x1a4(%r15)
00000000002215d5	xorps	%xmm1, %xmm1
00000000002215d8	je	0x2215e2
00000000002215da	movss	0x1a8b2e(%rip), %xmm1
00000000002215e2	movq	(%rbx), %rax
00000000002215e5	xorl	%r14d, %r14d
00000000002215e8	xorps	%xmm0, %xmm0
00000000002215eb	xorps	%xmm2, %xmm2
00000000002215ee	xorps	%xmm3, %xmm3
00000000002215f1	movq	%rbx, %rdi
00000000002215f4	xorl	%esi, %esi
00000000002215f6	movss	%xmm1, -0x34(%rbp)
00000000002215fb	callq	*0x60(%rax)
00000000002215fe	movl	0x198(%r15), %eax
0000000000221605	testl	%eax, %eax
0000000000221607	je	0x2217bc
000000000022160d	cmpl	$0x1, %eax
0000000000221610	je	0x2216f6
0000000000221616	cmpl	$0x2, %eax
0000000000221619	jne	0x221871
000000000022161f	movl	$0x1d0, %edi                    ## imm = 0x1D0
0000000000221624	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000221629	movq	%rax, %r12
000000000022162c	movq	%rax, %rdi
000000000022162f	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
0000000000221634	movq	(%r12), %rax
0000000000221638	xorl	%r14d, %r14d
000000000022163b	movq	%r12, %rdi
000000000022163e	xorl	%esi, %esi
0000000000221640	movq	-0x30(%rbp), %rdx
0000000000221644	callq	*0x78(%rax)
0000000000221647	xorl	%r14d, %r14d
000000000022164a	movq	%r12, %rdi
000000000022164d	movl	$0x2, %esi
0000000000221652	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
0000000000221657	cmpl	$0x0, 0x1a4(%r15)
000000000022165f	je	0x221879
0000000000221665	movl	$0x1b0, %edi                    ## imm = 0x1B0
000000000022166a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000022166f	movq	%rax, %r14
0000000000221672	movq	%rax, %rdi
0000000000221675	callq	__ZN39HgcAVASpatialAverageAdaptive_LowerFieldC2Ev ## HgcAVASpatialAverageAdaptive_LowerField::HgcAVASpatialAverageAdaptive_LowerField()
000000000022167a	leaq	0x8100f7(%rip), %rax
0000000000221681	movq	%rax, (%r14)
0000000000221684	movsd	0x66b214(%rip), %xmm0
000000000022168c	movsd	%xmm0, 0x1a0(%r14)
0000000000221695	movq	0x198(%r14), %rax
000000000022169c	movss	(%rax), %xmm0
00000000002216a0	ucomiss	0x66b211(%rip), %xmm0
00000000002216a7	jne	0x2216da
00000000002216a9	jp	0x2216da
00000000002216ab	movss	0x4(%rax), %xmm0
00000000002216b0	ucomiss	0x66b205(%rip), %xmm0
00000000002216b7	jne	0x2216da
00000000002216b9	jp	0x2216da
00000000002216bb	movss	0x8(%rax), %xmm1
00000000002216c0	xorps	%xmm0, %xmm0
00000000002216c3	ucomiss	%xmm0, %xmm1
00000000002216c6	jne	0x2216da
00000000002216c8	jp	0x2216da
00000000002216ca	movss	0xc(%rax), %xmm1
00000000002216cf	ucomiss	%xmm0, %xmm1
00000000002216d2	jne	0x2216da
00000000002216d4	jnp	0x221901
00000000002216da	movsd	0x66b1be(%rip), %xmm0
00000000002216e2	movups	%xmm0, 0x10(%rax)
00000000002216e6	movups	%xmm0, (%rax)
00000000002216e9	movq	%r14, %rdi
00000000002216ec	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000002216f1	jmp	0x221901
00000000002216f6	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000002216fb	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000221700	movq	%rax, %r14
0000000000221703	movq	%rax, %rdi
0000000000221706	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000022170b	leaq	0x80f3d6(%rip), %rax
0000000000221712	movq	%rax, (%r14)
0000000000221715	movl	$0x87, %edi
000000000022171a	callq	0x3c4fac                        ## symbol stub for: __Znam
000000000022171f	leaq	0x8(%rax), %rcx
0000000000221723	negl	%ecx
0000000000221725	andl	$0x1f, %ecx
0000000000221728	leaq	(%rcx,%rax), %rdx
000000000022172c	addq	$0x8, %rdx
0000000000221730	movq	%rax, (%rcx,%rax)
0000000000221734	xorps	%xmm0, %xmm0
0000000000221737	movaps	%xmm0, 0x8(%rcx,%rax)
000000000022173c	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000221741	movaps	0x66b0c8(%rip), %xmm0
0000000000221748	movaps	%xmm0, 0x38(%rcx,%rax)
000000000022174d	movaps	%xmm0, 0x28(%rcx,%rax)
0000000000221752	movaps	0x66b0c7(%rip), %xmm0
0000000000221759	movaps	%xmm0, 0x58(%rcx,%rax)
000000000022175e	movaps	%xmm0, 0x48(%rcx,%rax)
0000000000221763	movq	%rdx, 0x198(%r14)
000000000022176a	movq	(%r14), %rax
000000000022176d	movq	%r14, %rdi
0000000000221770	xorl	%esi, %esi
0000000000221772	movl	$0x1, %edx
0000000000221777	callq	*0x88(%rax)
000000000022177d	movl	$0xfffff9fe, %eax               ## imm = 0xFFFFF9FE
0000000000221782	andl	0x10(%r14), %eax
0000000000221786	orl	$0x401, %eax                    ## imm = 0x401
000000000022178b	movl	%eax, 0x10(%r14)
000000000022178f	movq	(%r14), %rax
0000000000221792	movq	%r14, %rdi
0000000000221795	xorl	%esi, %esi
0000000000221797	movq	-0x30(%rbp), %rdx
000000000022179b	callq	*0x78(%rax)
000000000022179e	movq	(%r14), %rax
00000000002217a1	xorps	%xmm0, %xmm0
00000000002217a4	xorps	%xmm2, %xmm2
00000000002217a7	xorps	%xmm3, %xmm3
00000000002217aa	movq	%r14, %rdi
00000000002217ad	xorl	%esi, %esi
00000000002217af	movss	-0x34(%rbp), %xmm1
00000000002217b4	callq	*0x60(%rax)
00000000002217b7	jmp	0x22192a
00000000002217bc	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000002217c1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000002217c6	movq	%rax, %r14
00000000002217c9	movq	%rax, %rdi
00000000002217cc	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000002217d1	leaq	0x80f0d0(%rip), %rax
00000000002217d8	movq	%rax, (%r14)
00000000002217db	movl	$0x67, %edi
00000000002217e0	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000002217e5	leaq	0x8(%rax), %rcx
00000000002217e9	negl	%ecx
00000000002217eb	andl	$0x1f, %ecx
00000000002217ee	leaq	(%rcx,%rax), %rdx
00000000002217f2	addq	$0x8, %rdx
00000000002217f6	movq	%rax, (%rcx,%rax)
00000000002217fa	xorps	%xmm0, %xmm0
00000000002217fd	movaps	%xmm0, 0x8(%rcx,%rax)
0000000000221802	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000221807	movaps	0x1a6462(%rip), %xmm0
000000000022180e	movaps	%xmm0, 0x38(%rcx,%rax)
0000000000221813	movaps	%xmm0, 0x28(%rcx,%rax)
0000000000221818	movq	%rdx, 0x198(%r14)
000000000022181f	movq	(%r14), %rax
0000000000221822	movq	%r14, %rdi
0000000000221825	xorl	%esi, %esi
0000000000221827	movl	$0x1, %edx
000000000022182c	callq	*0x88(%rax)
0000000000221832	movl	$0xfffff9fe, %eax               ## imm = 0xFFFFF9FE
0000000000221837	andl	0x10(%r14), %eax
000000000022183b	orl	$0x401, %eax                    ## imm = 0x401
0000000000221840	movl	%eax, 0x10(%r14)
0000000000221844	movq	(%r14), %rax
0000000000221847	movq	%r14, %rdi
000000000022184a	xorl	%esi, %esi
000000000022184c	movq	-0x30(%rbp), %rdx
0000000000221850	callq	*0x78(%rax)
0000000000221853	movq	(%r14), %rax
0000000000221856	xorps	%xmm0, %xmm0
0000000000221859	xorps	%xmm2, %xmm2
000000000022185c	xorps	%xmm3, %xmm3
000000000022185f	movq	%r14, %rdi
0000000000221862	xorl	%esi, %esi
0000000000221864	movss	-0x34(%rbp), %xmm1
0000000000221869	callq	*0x60(%rax)
000000000022186c	jmp	0x22192a
0000000000221871	xorl	%r14d, %r14d
0000000000221874	jmp	0x221c3a
0000000000221879	movl	$0x1b0, %edi                    ## imm = 0x1B0
000000000022187e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000221883	movq	%rax, %r14
0000000000221886	movq	%rax, %rdi
0000000000221889	callq	__ZN39HgcAVASpatialAverageAdaptive_UpperFieldC2Ev ## HgcAVASpatialAverageAdaptive_UpperField::HgcAVASpatialAverageAdaptive_UpperField()
000000000022188e	leaq	0x81013b(%rip), %rax
0000000000221895	movq	%rax, (%r14)
0000000000221898	movsd	0x66b000(%rip), %xmm0
00000000002218a0	movsd	%xmm0, 0x1a0(%r14)
00000000002218a9	movq	0x198(%r14), %rax
00000000002218b0	movss	(%rax), %xmm0
00000000002218b4	ucomiss	0x66affd(%rip), %xmm0
00000000002218bb	jne	0x2218ea
00000000002218bd	jp	0x2218ea
00000000002218bf	movss	0x4(%rax), %xmm0
00000000002218c4	ucomiss	0x66aff1(%rip), %xmm0
00000000002218cb	jne	0x2218ea
00000000002218cd	jp	0x2218ea
00000000002218cf	movss	0x8(%rax), %xmm1
00000000002218d4	xorps	%xmm0, %xmm0
00000000002218d7	ucomiss	%xmm0, %xmm1
00000000002218da	jne	0x2218ea
00000000002218dc	jp	0x2218ea
00000000002218de	movss	0xc(%rax), %xmm1
00000000002218e3	ucomiss	%xmm0, %xmm1
00000000002218e6	jne	0x2218ea
00000000002218e8	jnp	0x221901
00000000002218ea	movsd	0x66afae(%rip), %xmm0
00000000002218f2	movups	%xmm0, 0x10(%rax)
00000000002218f6	movups	%xmm0, (%rax)
00000000002218f9	movq	%r14, %rdi
00000000002218fc	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000221901	movq	(%r14), %rax
0000000000221904	movq	%r14, %rdi
0000000000221907	xorl	%esi, %esi
0000000000221909	movq	%r12, %rdx
000000000022190c	callq	*0x78(%rax)
000000000022190f	movq	(%r14), %rax
0000000000221912	movq	%r14, %rdi
0000000000221915	movl	$0x1, %esi
000000000022191a	movq	%rbx, %rdx
000000000022191d	callq	*0x78(%rax)
0000000000221920	movq	(%r12), %rax
0000000000221924	movq	%r12, %rdi
0000000000221927	callq	*0x18(%rax)
000000000022192a	cmpb	$0x0, 0x1a8(%r15)
0000000000221932	je	0x221973
0000000000221934	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000221939	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000022193e	movq	%rax, %r12
0000000000221941	movq	%rax, %rdi
0000000000221944	callq	__ZN34HGInterlaceHandler_InterlaceFieldsC1Ev ## HGInterlaceHandler_InterlaceFields::HGInterlaceHandler_InterlaceFields()
0000000000221949	movq	0x1b0(%r15), %rdi
0000000000221950	cmpq	%r12, %rdi
0000000000221953	je	0x221b4f
0000000000221959	testq	%rdi, %rdi
000000000022195c	je	0x221964
000000000022195e	movq	(%rdi), %rax
0000000000221961	callq	*0x18(%rax)
0000000000221964	movq	%r12, 0x1b0(%r15)
000000000022196b	movq	%r12, %rdi
000000000022196e	jmp	0x221b65
0000000000221973	movq	%r13, %rdi
0000000000221976	movq	%r15, %rsi
0000000000221979	movl	$0x1, %edx
000000000022197e	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000221983	movq	%rax, %r12
0000000000221986	movq	%r13, -0x58(%rbp)
000000000022198a	movq	%r13, %rdi
000000000022198d	movq	%r15, %rsi
0000000000221990	movl	$0x2, %edx
0000000000221995	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000022199a	movq	%rax, -0x60(%rbp)
000000000022199e	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000002219a3	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000002219a8	movq	%rax, %r13
00000000002219ab	movq	%rax, %rdi
00000000002219ae	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
00000000002219b3	movq	(%r13), %rax
00000000002219b7	movq	%r13, %rdi
00000000002219ba	xorl	%esi, %esi
00000000002219bc	movq	-0x30(%rbp), %rdx
00000000002219c0	movq	%r13, -0x48(%rbp)
00000000002219c4	callq	*0x78(%rax)
00000000002219c7	movq	%r13, %rdi
00000000002219ca	movl	$0x2, %esi
00000000002219cf	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
00000000002219d4	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000002219d9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000002219de	movq	%rax, %r13
00000000002219e1	movq	%rax, %rdi
00000000002219e4	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
00000000002219e9	movq	(%r13), %rax
00000000002219ed	movq	%r13, %rdi
00000000002219f0	xorl	%esi, %esi
00000000002219f2	movq	%r12, %rdx
00000000002219f5	movq	%r13, -0x40(%rbp)
00000000002219f9	callq	*0x78(%rax)
00000000002219fc	movq	%r13, %rdi
00000000002219ff	movl	$0x2, %esi
0000000000221a04	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
0000000000221a09	movl	$0x1d0, %edi                    ## imm = 0x1D0
0000000000221a0e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000221a13	movq	%rax, %r12
0000000000221a16	movq	%rax, %rdi
0000000000221a19	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
0000000000221a1e	movq	(%r12), %rax
0000000000221a22	movq	%r12, %rdi
0000000000221a25	xorl	%esi, %esi
0000000000221a27	movq	%r14, %rdx
0000000000221a2a	movq	%r12, -0x50(%rbp)
0000000000221a2e	callq	*0x78(%rax)
0000000000221a31	movq	%r12, %rdi
0000000000221a34	movl	$0x2, %esi
0000000000221a39	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
0000000000221a3e	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000221a43	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000221a48	movq	%rax, %r12
0000000000221a4b	movq	%rax, %rdi
0000000000221a4e	callq	__ZN13HgcAVA_FusionC2Ev         ## HgcAVA_Fusion::HgcAVA_Fusion()
0000000000221a53	movss	0x19c(%r15), %xmm0
0000000000221a5c	movss	0x1a0(%r15), %xmm1
0000000000221a65	movq	(%r12), %rax
0000000000221a69	xorps	%xmm2, %xmm2
0000000000221a6c	xorps	%xmm3, %xmm3
0000000000221a6f	movq	%r12, %rdi
0000000000221a72	xorl	%esi, %esi
0000000000221a74	callq	*0x60(%rax)
0000000000221a77	movq	(%r12), %rax
0000000000221a7b	xorps	%xmm0, %xmm0
0000000000221a7e	xorps	%xmm2, %xmm2
0000000000221a81	xorps	%xmm3, %xmm3
0000000000221a84	movq	%r12, %rdi
0000000000221a87	movl	$0x1, %esi
0000000000221a8c	movss	-0x34(%rbp), %xmm1
0000000000221a91	callq	*0x60(%rax)
0000000000221a94	movq	(%r12), %rax
0000000000221a98	movq	%r12, %rdi
0000000000221a9b	xorl	%esi, %esi
0000000000221a9d	movq	-0x50(%rbp), %rdx
0000000000221aa1	callq	*0x78(%rax)
0000000000221aa4	movq	(%r12), %rax
0000000000221aa8	movq	%r12, %rdi
0000000000221aab	movl	$0x1, %esi
0000000000221ab0	movq	-0x60(%rbp), %rdx
0000000000221ab4	callq	*0x78(%rax)
0000000000221ab7	movq	(%r12), %rax
0000000000221abb	movq	%r12, %rdi
0000000000221abe	movl	$0x2, %esi
0000000000221ac3	movq	-0x40(%rbp), %rdx
0000000000221ac7	callq	*0x78(%rax)
0000000000221aca	movq	(%r12), %rax
0000000000221ace	movq	%r12, %rdi
0000000000221ad1	movl	$0x3, %esi
0000000000221ad6	movq	%rbx, %rdx
0000000000221ad9	callq	*0x78(%rax)
0000000000221adc	movq	(%r12), %rax
0000000000221ae0	movq	%r12, %rdi
0000000000221ae3	movl	$0x4, %esi
0000000000221ae8	movq	-0x48(%rbp), %rdx
0000000000221aec	callq	*0x78(%rax)
0000000000221aef	movq	-0x58(%rbp), %rdi
0000000000221af3	movq	(%rdi), %rax
0000000000221af6	callq	*0x130(%rax)
0000000000221afc	testb	%al, %al
0000000000221afe	jne	0x221b17
0000000000221b00	movq	(%r12), %rax
0000000000221b04	movq	%r12, %rdi
0000000000221b07	movl	$0x1, %esi
0000000000221b0c	movl	$0x2, %edx
0000000000221b11	callq	*0x88(%rax)
0000000000221b17	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000221b1c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000221b21	movq	%rax, %r13
0000000000221b24	movq	%rax, %rdi
0000000000221b27	callq	__ZN34HGInterlaceHandler_InterlaceFieldsC1Ev ## HGInterlaceHandler_InterlaceFields::HGInterlaceHandler_InterlaceFields()
0000000000221b2c	movq	0x1b0(%r15), %rdi
0000000000221b33	cmpq	%r13, %rdi
0000000000221b36	je	0x221baf
0000000000221b38	testq	%rdi, %rdi
0000000000221b3b	je	0x221b43
0000000000221b3d	movq	(%rdi), %rax
0000000000221b40	callq	*0x18(%rax)
0000000000221b43	movq	%r13, 0x1b0(%r15)
0000000000221b4a	movq	%r13, %rdi
0000000000221b4d	jmp	0x221bc5
0000000000221b4f	testq	%r12, %r12
0000000000221b52	je	0x221b65
0000000000221b54	movq	(%r12), %rax
0000000000221b58	movq	%r12, %rdi
0000000000221b5b	callq	*0x18(%rax)
0000000000221b5e	movq	0x1b0(%r15), %rdi
0000000000221b65	xorps	%xmm0, %xmm0
0000000000221b68	cvtsi2ssl	0x1a4(%r15), %xmm0
0000000000221b71	movq	(%rdi), %rax
0000000000221b74	xorps	%xmm1, %xmm1
0000000000221b77	xorps	%xmm2, %xmm2
0000000000221b7a	xorps	%xmm3, %xmm3
0000000000221b7d	xorl	%esi, %esi
0000000000221b7f	callq	*0x60(%rax)
0000000000221b82	movq	0x1b0(%r15), %rdi
0000000000221b89	movq	(%rdi), %rax
0000000000221b8c	xorl	%esi, %esi
0000000000221b8e	movq	-0x30(%rbp), %rdx
0000000000221b92	callq	*0x78(%rax)
0000000000221b95	movq	0x1b0(%r15), %rdi
0000000000221b9c	movq	(%rdi), %rax
0000000000221b9f	movl	$0x1, %esi
0000000000221ba4	movq	%r14, %rdx
0000000000221ba7	callq	*0x78(%rax)
0000000000221baa	jmp	0x221c2f
0000000000221baf	testq	%r13, %r13
0000000000221bb2	je	0x221bc5
0000000000221bb4	movq	(%r13), %rax
0000000000221bb8	movq	%r13, %rdi
0000000000221bbb	callq	*0x18(%rax)
0000000000221bbe	movq	0x1b0(%r15), %rdi
0000000000221bc5	cvtsi2ssl	0x1a4(%r15), %xmm0
0000000000221bce	movq	(%rdi), %rax
0000000000221bd1	xorps	%xmm1, %xmm1
0000000000221bd4	xorps	%xmm2, %xmm2
0000000000221bd7	xorps	%xmm3, %xmm3
0000000000221bda	xorl	%esi, %esi
0000000000221bdc	callq	*0x60(%rax)
0000000000221bdf	movq	0x1b0(%r15), %rdi
0000000000221be6	movq	(%rdi), %rax
0000000000221be9	xorl	%esi, %esi
0000000000221beb	movq	-0x30(%rbp), %rdx
0000000000221bef	callq	*0x78(%rax)
0000000000221bf2	movq	0x1b0(%r15), %rdi
0000000000221bf9	movq	(%rdi), %rax
0000000000221bfc	movl	$0x1, %esi
0000000000221c01	movq	%r12, %rdx
0000000000221c04	callq	*0x78(%rax)
0000000000221c07	movq	(%r12), %rax
0000000000221c0b	movq	%r12, %rdi
0000000000221c0e	callq	*0x18(%rax)
0000000000221c11	movq	-0x50(%rbp), %rdi
0000000000221c15	movq	(%rdi), %rax
0000000000221c18	callq	*0x18(%rax)
0000000000221c1b	movq	-0x40(%rbp), %rdi
0000000000221c1f	movq	(%rdi), %rax
0000000000221c22	callq	*0x18(%rax)
0000000000221c25	movq	-0x48(%rbp), %rdi
0000000000221c29	movq	(%rdi), %rax
0000000000221c2c	callq	*0x18(%rax)
0000000000221c2f	movq	0x1b0(%r15), %rax
0000000000221c36	movq	%rax, -0x30(%rbp)
0000000000221c3a	movq	(%rbx), %rax
0000000000221c3d	movq	%rbx, %rdi
0000000000221c40	callq	*0x18(%rax)
0000000000221c43	testq	%r14, %r14
0000000000221c46	je	0x221c51
0000000000221c48	movq	(%r14), %rax
0000000000221c4b	movq	%r14, %rdi
0000000000221c4e	callq	*0x18(%rax)
0000000000221c51	movq	-0x30(%rbp), %rax
0000000000221c55	addq	$0x38, %rsp
0000000000221c59	popq	%rbx
0000000000221c5a	popq	%r12
0000000000221c5c	popq	%r13
0000000000221c5e	popq	%r14
0000000000221c60	popq	%r15
0000000000221c62	popq	%rbp
0000000000221c63	retq
0000000000221c64	movq	%rax, %rdi
0000000000221c67	callq	___clang_call_terminate
0000000000221c6c	movq	%rax, %rdi
0000000000221c6f	callq	___clang_call_terminate
0000000000221c74	movq	%rax, %r15
0000000000221c77	movq	%r14, %rdi
0000000000221c7a	callq	__ZN39HgcAVASpatialAverageAdaptive_UpperFieldD2Ev ## HgcAVASpatialAverageAdaptive_UpperField::~HgcAVASpatialAverageAdaptive_UpperField()
0000000000221c7f	jmp	0x221cdb
0000000000221c81	jmp	0x221cd8
0000000000221c83	jmp	0x221ceb
0000000000221c85	movq	%rax, %r15
0000000000221c88	testq	%r13, %r13
0000000000221c8b	je	0x221e64
0000000000221c91	movq	(%r13), %rax
0000000000221c95	movq	%r13, %rdi
0000000000221c98	callq	*0x18(%rax)
0000000000221c9b	jmp	0x221e64
0000000000221ca0	movq	%rax, %rdi
0000000000221ca3	callq	___clang_call_terminate
0000000000221ca8	movq	%rax, %r15
0000000000221cab	testq	%r12, %r12
0000000000221cae	je	0x221e8c
0000000000221cb4	movq	(%r12), %rax
0000000000221cb8	movq	%r12, %rdi
0000000000221cbb	callq	*0x18(%rax)
0000000000221cbe	jmp	0x221e8c
0000000000221cc3	movq	%rax, %rdi
0000000000221cc6	callq	___clang_call_terminate
0000000000221ccb	movq	%rax, %r15
0000000000221cce	movq	%r14, %rdi
0000000000221cd1	callq	__ZN39HgcAVASpatialAverageAdaptive_LowerFieldD2Ev ## HgcAVASpatialAverageAdaptive_LowerField::~HgcAVASpatialAverageAdaptive_LowerField()
0000000000221cd6	jmp	0x221cdb
0000000000221cd8	movq	%rax, %r15
0000000000221cdb	movq	%r14, %rdi
0000000000221cde	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221ce3	xorl	%r14d, %r14d
0000000000221ce6	jmp	0x221e12
0000000000221ceb	movq	%rax, %r15
0000000000221cee	xorl	%r14d, %r14d
0000000000221cf1	jmp	0x221e12
0000000000221cf6	movq	%rax, %rdi
0000000000221cf9	callq	___clang_call_terminate
0000000000221cfe	movq	%rax, %r15
0000000000221d01	movq	%r12, %rdi
0000000000221d04	jmp	0x221de3
0000000000221d09	jmp	0x221d0b
0000000000221d0b	movq	%rax, %r15
0000000000221d0e	jmp	0x221de0
0000000000221d13	jmp	0x221e26
0000000000221d18	jmp	0x221e26
0000000000221d1d	jmp	0x221e26
0000000000221d22	movq	%rax, %rdi
0000000000221d25	callq	___clang_call_terminate
0000000000221d2a	movq	%rax, %rdi
0000000000221d2d	callq	___clang_call_terminate
0000000000221d32	movq	%rax, %rdi
0000000000221d35	callq	___clang_call_terminate
0000000000221d3a	movq	%rax, %rdi
0000000000221d3d	callq	___clang_call_terminate
0000000000221d42	movq	%rax, %r15
0000000000221d45	movq	%r13, %rdi
0000000000221d48	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221d4d	jmp	0x221e64
0000000000221d52	jmp	0x221e61
0000000000221d57	movq	%rax, %r15
0000000000221d5a	movq	%r12, %rdi
0000000000221d5d	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221d62	jmp	0x221e6e
0000000000221d67	movq	%rax, %r15
0000000000221d6a	jmp	0x221e6e
0000000000221d6f	movq	%rax, %r15
0000000000221d72	movq	%r12, %rdi
0000000000221d75	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221d7a	jmp	0x221e78
0000000000221d7f	movq	%rax, %r15
0000000000221d82	jmp	0x221e78
0000000000221d87	movq	%rax, %r15
0000000000221d8a	movq	%r13, %rdi
0000000000221d8d	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221d92	jmp	0x221e82
0000000000221d97	movq	%rax, %r15
0000000000221d9a	jmp	0x221e82
0000000000221d9f	movq	%rax, %r15
0000000000221da2	movq	%r13, %rdi
0000000000221da5	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221daa	jmp	0x221e8c
0000000000221daf	jmp	0x221e5c
0000000000221db4	jmp	0x221e5c
0000000000221db9	movq	%rax, %r15
0000000000221dbc	movq	%r12, %rdi
0000000000221dbf	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221dc4	jmp	0x221e8c
0000000000221dc9	jmp	0x221e5c
0000000000221dce	jmp	0x221e5c
0000000000221dd3	jmp	0x221dd5
0000000000221dd5	movq	%rax, %r15
0000000000221dd8	movq	%r14, %rdi
0000000000221ddb	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000221de0	movq	%r14, %rdi
0000000000221de3	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221de8	xorl	%r14d, %r14d
0000000000221deb	jmp	0x221e8c
0000000000221df0	movq	%rax, %rdi
0000000000221df3	callq	___clang_call_terminate
0000000000221df8	movq	%rax, %r15
0000000000221dfb	jmp	0x221e6e
0000000000221dfd	movq	%rax, %r15
0000000000221e00	jmp	0x221e78
0000000000221e02	movq	%rax, %r15
0000000000221e05	jmp	0x221e82
0000000000221e07	movq	%rax, %rdi
0000000000221e0a	callq	___clang_call_terminate
0000000000221e0f	movq	%rax, %r15
0000000000221e12	movq	(%r12), %rax
0000000000221e16	movq	%r12, %rdi
0000000000221e19	callq	*0x18(%rax)
0000000000221e1c	jmp	0x221e8c
0000000000221e1e	movq	%rax, %rdi
0000000000221e21	callq	___clang_call_terminate
0000000000221e26	movq	%rax, %r15
0000000000221e29	xorl	%r14d, %r14d
0000000000221e2c	jmp	0x221e8c
0000000000221e2e	movq	%rax, %r15
0000000000221e31	movq	%rbx, %rdi
0000000000221e34	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221e39	movq	%r15, %rdi
0000000000221e3c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000221e41	movq	%rax, %r15
0000000000221e44	movq	%rbx, %rdi
0000000000221e47	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000221e4c	movq	%rbx, %rdi
0000000000221e4f	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000221e54	movq	%r15, %rdi
0000000000221e57	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000221e5c	movq	%rax, %r15
0000000000221e5f	jmp	0x221e8c
0000000000221e61	movq	%rax, %r15
0000000000221e64	movq	(%r12), %rax
0000000000221e68	movq	%r12, %rdi
0000000000221e6b	callq	*0x18(%rax)
0000000000221e6e	movq	-0x50(%rbp), %rdi
0000000000221e72	movq	(%rdi), %rax
0000000000221e75	callq	*0x18(%rax)
0000000000221e78	movq	-0x40(%rbp), %rdi
0000000000221e7c	movq	(%rdi), %rax
0000000000221e7f	callq	*0x18(%rax)
0000000000221e82	movq	-0x48(%rbp), %rdi
0000000000221e86	movq	(%rdi), %rax
0000000000221e89	callq	*0x18(%rax)
0000000000221e8c	movq	(%rbx), %rax
0000000000221e8f	movq	%rbx, %rdi
0000000000221e92	callq	*0x18(%rax)
0000000000221e95	testq	%r14, %r14
0000000000221e98	je	0x221ea3
0000000000221e9a	movq	(%r14), %rax
0000000000221e9d	movq	%r14, %rdi
0000000000221ea0	callq	*0x18(%rax)
0000000000221ea3	movq	%r15, %rdi
0000000000221ea6	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000221eab	movq	%rax, %rdi
0000000000221eae	callq	___clang_call_terminate
0000000000221eb3	movq	%rax, %rdi
0000000000221eb6	callq	___clang_call_terminate
0000000000221ebb	movq	%rax, %rdi
0000000000221ebe	callq	___clang_call_terminate
0000000000221ec3	movq	%rax, %rdi
0000000000221ec6	callq	___clang_call_terminate
0000000000221ecb	movq	%rax, %rdi
0000000000221ece	callq	___clang_call_terminate
0000000000221ed3	movq	%rax, %rdi
0000000000221ed6	callq	___clang_call_terminate
0000000000221edb	nopl	(%rax,%rax)
