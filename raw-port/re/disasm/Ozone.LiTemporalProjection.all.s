00000000004b3713	cmpq	$0x0, 0x3b8(%rbx)
00000000004b371b	je	0x4b3727
00000000004b371d	xorl	%eax, %eax
00000000004b371f	movzbl	%al, %eax
00000000004b3722	popq	%rbx
00000000004b3723	popq	%r14
00000000004b3725	popq	%rbp
00000000004b3726	retq
00000000004b3727	movq	%rax, %r14
00000000004b372a	movq	%rbx, %rdi
00000000004b372d	callq	__ZNK9OZElement16getDimensionTypeEv ## OZElement::getDimensionType() const
00000000004b3732	testl	%eax, %eax
00000000004b3734	jne	0x4b371d
00000000004b3736	movb	$0x1, %al
00000000004b3738	testq	%r14, %r14
00000000004b373b	jne	0x4b371f
00000000004b373d	jmp	0x4b371d
00000000004b373f	addb	%dl, 0x48(%rbp)
00000000004b3742	movl	%esp, %ebp
00000000004b3744	pushq	%r15
00000000004b3746	pushq	%r14
00000000004b3748	pushq	%r12
00000000004b374a	pushq	%rbx
00000000004b374b	movq	%rsi, %rbx
00000000004b374e	movq	%rdi, %r14
00000000004b3751	movq	(%rsi), %rax
00000000004b3754	movq	%rax, (%rdi)
00000000004b3757	movq	0x48(%rsi), %rcx
00000000004b375b	movq	-0x18(%rax), %rax
00000000004b375f	movq	%rcx, (%rdi,%rax)
00000000004b3763	addq	$0x168, %rdi                    ## imm = 0x168
00000000004b376a	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000004b376f	leaq	0x110(%r14), %rdi
00000000004b3776	leaq	__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE(%rip), %rax ## vtable for PCArray<LiLight, PCArray_Traits<LiLight>>
00000000004b377d	addq	$0x10, %rax
00000000004b3781	movq	%rax, 0x110(%r14)
00000000004b3788	movl	0x118(%r14), %eax
00000000004b378f	testl	%eax, %eax
00000000004b3791	movl	$0x1, %edx
00000000004b3796	cmovnsl	%eax, %edx
00000000004b3799	xorl	%esi, %esi
00000000004b379b	callq	__ZN7PCArrayI7LiLight14PCArray_TraitsIS0_EE6resizeEii ## PCArray<LiLight, PCArray_Traits<LiLight>>::resize(int, int)
00000000004b37a0	movq	0x120(%r14), %rdi
00000000004b37a7	testq	%rdi, %rdi
00000000004b37aa	je	0x4b37b1
00000000004b37ac	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000004b37b1	movq	$0x0, 0x120(%r14)
00000000004b37bc	movl	$0x0, 0x118(%r14)
00000000004b37c7	cmpq	$0x0, 0x80(%r14)
00000000004b37cf	je	0x4b3811
00000000004b37d1	leaq	0x70(%r14), %r15
00000000004b37d5	movq	0x70(%r14), %rax
00000000004b37d9	movq	0x78(%r14), %rdi
00000000004b37dd	movq	0x8(%rax), %rax
00000000004b37e1	movq	(%rdi), %rcx
00000000004b37e4	movq	%rax, 0x8(%rcx)
00000000004b37e8	movq	%rcx, (%rax)
00000000004b37eb	movq	$0x0, 0x80(%r14)
00000000004b37f6	cmpq	%r15, %rdi
00000000004b37f9	je	0x4b3811
00000000004b37fb	nopl	(%rax,%rax)
00000000004b3800	movq	0x8(%rdi), %r12
00000000004b3804	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004b3809	movq	%r12, %rdi
00000000004b380c	cmpq	%r15, %r12
00000000004b380f	jne	0x4b3800
00000000004b3811	movq	0x10(%rbx), %rax
00000000004b3815	movq	%rax, (%r14)
00000000004b3818	movq	0x38(%rbx), %rcx
00000000004b381c	movq	-0x18(%rax), %rax
00000000004b3820	movq	%rcx, (%r14,%rax)
00000000004b3824	leaq	0x18(%r14), %rdi
00000000004b3828	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000004b382d	addq	$0x18, %rbx
00000000004b3831	movq	%r14, %rdi
00000000004b3834	movq	%rbx, %rsi
00000000004b3837	popq	%rbx
00000000004b3838	popq	%r12
00000000004b383a	popq	%r14
00000000004b383c	popq	%r15
00000000004b383e	popq	%rbp
00000000004b383f	jmp	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
00000000004b3844	movq	%rax, %rdi
00000000004b3847	callq	___clang_call_terminate
00000000004b384c	nopl	(%rax)
__ZN20LiTemporalProjectionD1Ev:
00000000004b3850	pushq	%rbp
00000000004b3851	movq	%rsp, %rbp
00000000004b3854	pushq	%rbx
00000000004b3855	pushq	%rax
00000000004b3856	movq	%rdi, %rbx
00000000004b3859	leaq	__ZTT20LiTemporalProjection(%rip), %rsi ## VTT for LiTemporalProjection
00000000004b3860	callq	__ZN20LiTemporalProjectionD2Ev  ## LiTemporalProjection::~LiTemporalProjection()
00000000004b3865	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000004b386c	addq	$0x10, %rax
00000000004b3870	movq	%rax, 0x170(%rbx)
00000000004b3877	movq	0x178(%rbx), %rdi
00000000004b387e	testq	%rdi, %rdi
00000000004b3881	je	0x4b3888
00000000004b3883	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000004b3888	addq	$0x8, %rsp
00000000004b388c	popq	%rbx
00000000004b388d	popq	%rbp
00000000004b388e	retq
00000000004b388f	movq	%rax, %rdi
00000000004b3892	callq	___clang_call_terminate
00000000004b3897	nopw	(%rax,%rax)
__ZTv0_n24_N20LiTemporalProjectionD1Ev:
00000000004b38a0	pushq	%rbp
00000000004b38a1	movq	%rsp, %rbp
00000000004b38a4	pushq	%r14
00000000004b38a6	pushq	%rbx
00000000004b38a7	movq	%rdi, %rbx
00000000004b38aa	movq	(%rdi), %rax
00000000004b38ad	movq	-0x18(%rax), %r14
00000000004b38b1	addq	%r14, %rdi
00000000004b38b4	leaq	__ZTT20LiTemporalProjection(%rip), %rsi ## VTT for LiTemporalProjection
00000000004b38bb	callq	__ZN20LiTemporalProjectionD2Ev  ## LiTemporalProjection::~LiTemporalProjection()
00000000004b38c0	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000004b38c7	addq	$0x10, %rax
00000000004b38cb	movq	%rax, 0x170(%rbx,%r14)
00000000004b38d3	movq	0x178(%rbx,%r14), %rdi
00000000004b38db	testq	%rdi, %rdi
00000000004b38de	je	0x4b38e5
00000000004b38e0	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000004b38e5	popq	%rbx
00000000004b38e6	popq	%r14
00000000004b38e8	popq	%rbp
00000000004b38e9	retq
00000000004b38ea	movq	%rax, %rdi
00000000004b38ed	callq	___clang_call_terminate
00000000004b38f2	nopw	%cs:(%rax,%rax)
__ZN20LiTemporalProjectionD0Ev:
00000000004b3900	pushq	%rbp
00000000004b3901	movq	%rsp, %rbp
00000000004b3904	pushq	%rbx
00000000004b3905	pushq	%rax
00000000004b3906	movq	%rdi, %rbx
00000000004b3909	leaq	__ZTT20LiTemporalProjection(%rip), %rsi ## VTT for LiTemporalProjection
00000000004b3910	callq	__ZN20LiTemporalProjectionD2Ev  ## LiTemporalProjection::~LiTemporalProjection()
00000000004b3915	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000004b391c	addq	$0x10, %rax
00000000004b3920	movq	%rax, 0x170(%rbx)
00000000004b3927	movq	0x178(%rbx), %rdi
00000000004b392e	testq	%rdi, %rdi
00000000004b3931	je	0x4b3938
00000000004b3933	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000004b3938	movq	%rbx, %rdi
00000000004b393b	addq	$0x8, %rsp
00000000004b393f	popq	%rbx
00000000004b3940	popq	%rbp
00000000004b3941	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004b3946	movq	%rax, %rdi
00000000004b3949	callq	___clang_call_terminate
00000000004b394e	nop
__ZTv0_n24_N20LiTemporalProjectionD0Ev:
00000000004b3950	pushq	%rbp
00000000004b3951	movq	%rsp, %rbp
00000000004b3954	pushq	%r15
00000000004b3956	pushq	%r14
00000000004b3958	pushq	%rbx
00000000004b3959	pushq	%rax
00000000004b395a	movq	%rdi, %r14
00000000004b395d	movq	(%rdi), %rax
00000000004b3960	movq	-0x18(%rax), %r15
00000000004b3964	leaq	(%rdi,%r15), %rbx
00000000004b3968	leaq	__ZTT20LiTemporalProjection(%rip), %rsi ## VTT for LiTemporalProjection
00000000004b396f	movq	%rbx, %rdi
00000000004b3972	callq	__ZN20LiTemporalProjectionD2Ev  ## LiTemporalProjection::~LiTemporalProjection()
00000000004b3977	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000004b397e	addq	$0x10, %rax
00000000004b3982	movq	%rax, 0x170(%r14,%r15)
00000000004b398a	movq	0x178(%r14,%r15), %rdi
00000000004b3992	testq	%rdi, %rdi
00000000004b3995	je	0x4b399c
00000000004b3997	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000004b399c	movq	%rbx, %rdi
00000000004b399f	addq	$0x8, %rsp
00000000004b39a3	popq	%rbx
00000000004b39a4	popq	%r14
00000000004b39a6	popq	%r15
00000000004b39a8	popq	%rbp
00000000004b39a9	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004b39ae	movq	%rax, %rdi
00000000004b39b1	callq	___clang_call_terminate
00000000004b39b6	nopw	%cs:(%rax,%rax)
__ZN20LiTemporalProjection15getSourceAtTimeE6CMTimebRK14OZRenderParams:
00000000004b39c0	pushq	%rbp
00000000004b39c1	movq	%rsp, %rbp
00000000004b39c4	pushq	%r15
00000000004b39c6	pushq	%r14
00000000004b39c8	pushq	%rbx
00000000004b39c9	subq	$0x5c8, %rsp                    ## imm = 0x5C8
00000000004b39d0	movq	%rsi, %r14
00000000004b39d3	movq	%rdi, %rbx
00000000004b39d6	leaq	-0x5e0(%rbp), %r15
00000000004b39dd	movq	%r15, %rdi
00000000004b39e0	movq	%rcx, %rsi
00000000004b39e3	callq	__ZN14OZRenderParamsC1ERKS_     ## OZRenderParams::OZRenderParams(OZRenderParams const&)
00000000004b39e8	movq	0x20(%rbp), %rax
00000000004b39ec	movq	%rax, -0x5d0(%rbp)
00000000004b39f3	movaps	0x10(%rbp), %xmm0
00000000004b39f7	movaps	%xmm0, -0x5e0(%rbp)
00000000004b39fe	xorps	%xmm0, %xmm0
00000000004b3a01	movups	%xmm0, -0x458(%rbp)
00000000004b3a08	movq	0x28(%r14), %rsi
00000000004b3a0c	addq	$0x30, %r14
00000000004b3a10	movq	0x1978(%rsi), %rax
00000000004b3a17	addq	$0x1978, %rsi                   ## imm = 0x1978
00000000004b3a1e	movq	%rbx, %rdi
00000000004b3a21	movq	%r15, %rdx
00000000004b3a24	movq	%r14, %rcx
00000000004b3a27	xorl	%r8d, %r8d
00000000004b3a2a	callq	*0xa0(%rax)
00000000004b3a30	leaq	-0x5e0(%rbp), %rdi
00000000004b3a37	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
00000000004b3a3c	movq	%rbx, %rax
00000000004b3a3f	addq	$0x5c8, %rsp                    ## imm = 0x5C8
00000000004b3a46	popq	%rbx
00000000004b3a47	popq	%r14
00000000004b3a49	popq	%r15
00000000004b3a4b	popq	%rbp
00000000004b3a4c	retq
00000000004b3a4d	movq	%rax, %rbx
