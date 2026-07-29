__ZNK11OZ360Camera11getRotationEP6PCQuatIdE:
0000000000448780	pushq	%rbp
0000000000448781	movq	%rsp, %rbp
0000000000448784	pushq	%r14
0000000000448786	pushq	%rbx
0000000000448787	subq	$0x40, %rsp
000000000044878b	movq	%rsi, %rbx
000000000044878e	movq	%rdi, %r14
0000000000448791	movq	0x208(%rdi), %rsi
0000000000448798	leaq	-0x48(%rbp), %rdi
000000000044879c	callq	__ZNK7OZScene14getCurrentTimeEv ## OZScene::getCurrentTime() const
00000000004487a1	movq	-0x38(%rbp), %rax
00000000004487a5	movq	%rax, -0x20(%rbp)
00000000004487a9	movupd	-0x48(%rbp), %xmm0
00000000004487ae	movapd	%xmm0, -0x30(%rbp)
00000000004487b3	movq	0x208(%r14), %rdi
00000000004487ba	leaq	-0x30(%rbp), %rsi
00000000004487be	callq	__ZN7OZScene15getActiveCameraERK6CMTime ## OZScene::getActiveCamera(CMTime const&)
00000000004487c3	movq	0x208(%r14), %rdi
00000000004487ca	movl	%eax, %esi
00000000004487cc	callq	__ZN7OZScene7getNodeEj          ## OZScene::getNode(unsigned int)
00000000004487d1	testq	%rax, %rax
00000000004487d4	je	0x4488fd
00000000004487da	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000004487e1	leaq	__ZTI8OZCamera(%rip), %rdx      ## typeinfo for OZCamera
00000000004487e8	movq	%rax, %rdi
00000000004487eb	xorl	%ecx, %ecx
00000000004487ed	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004487f2	testq	%rax, %rax
00000000004487f5	je	0x4488fd
00000000004487fb	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
0000000000448805	movq	%rcx, -0x30(%rbp)
0000000000448809	xorpd	%xmm0, %xmm0
000000000044880d	movupd	%xmm0, -0x28(%rbp)
0000000000448812	movq	$0x0, -0x18(%rbp)
000000000044881a	addq	$0x830, %rax                    ## imm = 0x830
0000000000448820	leaq	-0x30(%rbp), %rsi
0000000000448824	leaq	-0x48(%rbp), %rdx
0000000000448828	xorpd	%xmm0, %xmm0
000000000044882c	movq	%rax, %rdi
000000000044882f	callq	0x6df6c6                        ## symbol stub for: __ZNK19OZChannelRotation3D15getValueAsQuatdER6PCQuatIdERK6CMTimed
0000000000448834	movsd	0x40(%r14), %xmm6
000000000044883a	movsd	-0x30(%rbp), %xmm0
000000000044883f	movsd	-0x28(%rbp), %xmm3
0000000000448844	movapd	%xmm0, %xmm4
0000000000448848	movddup	%xmm0, %xmm5                    ## xmm5 = xmm0[0,0]
000000000044884c	movddup	%xmm6, %xmm1                    ## xmm1 = xmm6[0,0]
0000000000448850	mulsd	%xmm6, %xmm0
0000000000448854	mulsd	%xmm3, %xmm6
0000000000448858	movupd	-0x20(%rbp), %xmm2
000000000044885d	movddup	%xmm6, %xmm7                    ## xmm7 = xmm6[0,0]
0000000000448861	movupd	0x48(%r14), %xmm6
0000000000448867	movapd	%xmm2, %xmm8
000000000044886c	mulpd	%xmm2, %xmm1
0000000000448870	movddup	0x58(%r14), %xmm9               ## xmm9 = mem[0,0]
0000000000448876	mulpd	%xmm2, %xmm9
000000000044887b	shufpd	$0x1, %xmm3, %xmm2              ## xmm2 = xmm2[1],xmm3[0]
0000000000448880	mulsd	%xmm6, %xmm3
0000000000448884	movupd	0x50(%r14), %xmm10
000000000044888a	mulsd	%xmm6, %xmm4
000000000044888e	mulpd	%xmm10, %xmm5
0000000000448893	mulsd	%xmm10, %xmm8
0000000000448898	addsd	%xmm3, %xmm8
000000000044889d	addpd	%xmm5, %xmm1
00000000004488a1	movddup	%xmm4, %xmm3                    ## xmm3 = xmm4[0,0]
00000000004488a5	addpd	%xmm7, %xmm3
00000000004488a9	movsd	-0x18(%rbp), %xmm4
00000000004488ae	mulpd	%xmm10, %xmm4
00000000004488b3	movddup	%xmm8, %xmm5                    ## xmm5 = xmm8[0,0]
00000000004488b8	addpd	%xmm9, %xmm5
00000000004488bd	subpd	%xmm4, %xmm9
00000000004488c2	shufpd	$0x1, %xmm9, %xmm5              ## xmm5 = xmm5[1],xmm9[0]
00000000004488c8	mulpd	%xmm6, %xmm2
00000000004488cc	shufpd	$0x1, %xmm6, %xmm10             ## xmm10 = xmm10[1],xmm6[0]
00000000004488d2	movupd	-0x28(%rbp), %xmm4
00000000004488d7	mulpd	%xmm10, %xmm4
00000000004488dc	subpd	%xmm4, %xmm2
00000000004488e0	addpd	%xmm1, %xmm2
00000000004488e4	subpd	%xmm5, %xmm0
00000000004488e8	addpd	%xmm3, %xmm5
00000000004488ec	blendpd	$0x1, %xmm0, %xmm5              ## xmm5 = xmm0[0],xmm5[1]
00000000004488f2	movupd	%xmm5, (%rbx)
00000000004488f6	movupd	%xmm2, 0x10(%rbx)
00000000004488fb	jmp	0x448923
00000000004488fd	leaq	0x40(%r14), %rax
0000000000448901	cmpq	%rbx, %rax
0000000000448904	je	0x448923
0000000000448906	movsd	0x40(%r14), %xmm0
000000000044890c	movsd	%xmm0, (%rbx)
0000000000448910	movupd	0x48(%r14), %xmm0
0000000000448916	movupd	%xmm0, 0x8(%rbx)
000000000044891b	movq	0x58(%r14), %rax
000000000044891f	movq	%rax, 0x18(%rbx)
0000000000448923	addq	$0x40, %rsp
0000000000448927	popq	%rbx
0000000000448928	popq	%r14
000000000044892a	popq	%rbp
000000000044892b	retq
000000000044892c	nopl	(%rax)
