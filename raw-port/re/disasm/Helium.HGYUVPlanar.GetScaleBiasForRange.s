__ZN11HGYUVPlanar20GetScaleBiasForRangeENS_10YCbCrRangeEi19HGFormatCompressionRA4_fS3_:
   e48f0:	55	pushq	%rbp
   e48f1:	48 89 e5	movq	%rsp, %rbp
   e48f4:	8d 47 fd	leal	-0x3(%rdi), %eax
   e48f7:	83 f8 03	cmpl	$0x3, %eax
   e48fa:	77 2c	ja	0xe4928
   e48fc:	f2 0f 10 05 9c a8 2e 00	movsd	0x2ea89c(%rip), %xmm0
   e4904:	f3 0f 10 0d c4 a8 2e 00	movss	0x2ea8c4(%rip), %xmm1
   e490c:	83 fe 02	cmpl	$0x2, %esi
   e490f:	74 4e	je	0xe495f
   e4911:	83 ff 06	cmpl	$0x6, %edi
   e4914:	74 49	je	0xe495f
   e4916:	83 e7 06	andl	$0x6, %edi
   e4919:	83 ff 04	cmpl	$0x4, %edi
   e491c:	74 41	je	0xe495f
   e491e:	f2 0f 10 15 8a a8 2e 00	movsd	0x2ea88a(%rip), %xmm2
   e4926:	eb 55	jmp	0xe497d
   e4928:	f2 0f 10 05 60 a8 2e 00	movsd	0x2ea860(%rip), %xmm0
   e4930:	f3 0f 10 0d 94 33 2e 00	movss	0x2e3394(%rip), %xmm1
   e4938:	83 ff 01	cmpl	$0x1, %edi
   e493b:	75 19	jne	0xe4956
   e493d:	31 c0	xorl	%eax, %eax
   e493f:	85 d2	testl	%edx, %edx
   e4941:	0f 94 c0	sete	%al
   e4944:	48 8d 15 8d a8 2e 00	leaq	0x2ea88d(%rip), %rdx
   e494b:	f3 0f 10 14 82	movss	(%rdx,%rax,4), %xmm2
   e4950:	f3 0f 12 d2	movsldup	%xmm2, %xmm2
   e4954:	eb 27	jmp	0xe497d
   e4956:	0f 28 15 53 57 2e 00	movaps	0x2e5753(%rip), %xmm2
   e495d:	eb 1e	jmp	0xe497d
   e495f:	31 c0	xorl	%eax, %eax
   e4961:	85 d2	testl	%edx, %edx
   e4963:	0f 94 c0	sete	%al
   e4966:	48 8d 15 73 a8 2e 00	leaq	0x2ea873(%rip), %rdx
   e496d:	f3 0f 10 14 82	movss	(%rdx,%rax,4), %xmm2
   e4972:	f3 0f 12 d2	movsldup	%xmm2, %xmm2
   e4976:	0f 5e 15 43 a8 2e 00	divps	0x2ea843(%rip), %xmm2
   e497d:	0f 13 11	movlps	%xmm2, (%rcx)
   e4980:	66 0f 3a 17 51 08 01	extractps	$0x1, %xmm2, 0x8(%rcx)
   e4987:	c7 41 0c 00 00 80 3f	movl	$0x3f800000, 0xc(%rcx)
   e498e:	41 0f 13 00	movlps	%xmm0, (%r8)
   e4992:	f3 41 0f 11 48 08	movss	%xmm1, 0x8(%r8)
   e4998:	41 c7 40 0c 00 00 00 00	movl	$0x0, 0xc(%r8)
   e49a0:	5d	popq	%rbp
   e49a1:	c3	retq
   e49a2:	66 66 66 66 66 2e 0f 1f 84 00 00 00 00 00	nopw	%cs:(%rax,%rax)
